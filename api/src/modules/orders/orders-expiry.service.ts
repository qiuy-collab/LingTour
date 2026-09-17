import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { StoreProduct } from '../shop/entities/store-product.entity';

const ORDER_PAYMENT_WINDOW_MINUTES = 60;
const MAX_ORDERS_PER_SWEEP = 100;

/**
 * Unpaid shop orders reserve stock at creation time and checkout is a
 * public endpoint, so without this sweep a handful of abandoned orders
 * could keep every product "sold out" indefinitely (report P1-4).
 *
 * Cancels pending, never-paid orders older than the payment window and
 * returns their reserved stock. Runs every minute; the createdAt index
 * keeps each sweep cheap and oversized backlogs converge quickly.
 */
@Injectable()
export class OrdersExpiryService {
  private readonly logger = new Logger(OrdersExpiryService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async cancelExpiredUnpaidOrders(): Promise<void> {
    const cutoff = new Date(
      Date.now() - ORDER_PAYMENT_WINDOW_MINUTES * 60_000,
    );
    const stale = await this.orderRepo.find({
      where: {
        status: 'pending',
        paymentStatus: 'unpaid',
        stockReserved: true,
        createdAt: LessThan(cutoff),
      },
      order: { createdAt: 'ASC' },
      take: MAX_ORDERS_PER_SWEEP,
    });

    for (const order of stale) {
      try {
        await this.orderRepo.manager.transaction(async (manager) => {
          const locked = await manager.findOne(Order, {
            where: { id: order.id },
            lock: { mode: 'pessimistic_write' },
          });
          // Re-check under the row lock: the order may have been paid,
          // refunded or cancelled between the sweep query and now.
          if (
            !locked ||
            locked.status !== 'pending' ||
            locked.paymentStatus !== 'unpaid'
          ) {
            return;
          }

          for (const item of locked.items ?? []) {
            await manager.increment(
              StoreProduct,
              { id: item.productId },
              'stock',
              item.quantity,
            );
          }
          locked.status = 'cancelled';
          locked.paymentStatus = 'failed';
          locked.paymentFailureReason = `Expired: payment was not completed within ${ORDER_PAYMENT_WINDOW_MINUTES} minutes`;
          locked.stockReserved = false;
          await manager.save(Order, locked);
        });
      } catch (error) {
        this.logger.error(
          `Failed to expire unpaid order ${order.orderNo}`,
          error as Error,
        );
      }
    }
  }
}
