import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  Order,
  type OrderStatus,
  type PaymentStatus,
} from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { v4 as uuidv4 } from 'uuid';

/**
 * 订单履约状态机：从 ← 到的合法迁移。
 * 注意：这里只管「履约」流转，不管「支付」流转。
 */
const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

@Injectable()
export class OrdersService {
  private stripe: Stripe | null = null;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly configService: ConfigService,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' });
    }
  }

  private get isStripeEnabled(): boolean {
    return this.stripe !== null;
  }

  /**
   * 创建订单（公开端点）。
   * 创建时强制为 status=pending / paymentStatus=unpaid。
   */
  async createOrder(dto: CreateOrderDto) {
    if (!dto.userId && !dto.guestEmail) {
      throw new BadRequestException('Either userId or guestEmail is required');
    }

    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    const order = this.orderRepo.create({
      orderNo: this.generateOrderNo(),
      userId: dto.userId ?? null,
      guestEmail: dto.guestEmail ?? null,
      status: 'pending',
      paymentStatus: 'unpaid',
      totalAmount,
      paymentMethod: dto.paymentMethod ?? 'stripe',
      shippingAddr: dto.shippingAddress as unknown as Record<string, any>,
    });

    const saved = await this.orderRepo.save(order);

    // Create Stripe PaymentIntent if configured, otherwise sandbox
    let stripeClientSecret: string;
    if (this.isStripeEnabled) {
      const pi = await this.stripe!.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // cents
        currency: 'sgd',
        metadata: { orderNo: saved.orderNo, orderId: saved.id },
        automatic_payment_methods: { enabled: true },
      });
      stripeClientSecret = pi.client_secret!;
    } else {
      stripeClientSecret = `pi_sandbox_${saved.orderNo}_secret_${uuidv4().slice(0, 8)}`;
    }

    return {
      orderId: saved.id,
      orderNo: saved.orderNo,
      totalAmount: saved.totalAmount,
      status: saved.status,
      paymentStatus: saved.paymentStatus,
      stripeClientSecret,
    };
  }

  async createInterpretingDeposit(input: {
    name: string;
    contact: string;
    city: string;
    serviceDate: string;
    supportMode: string;
    groupSize?: string | null;
    routeOrNeed?: string | null;
    depositAmount: number;
    currency?: string;
  }) {
    const order = this.orderRepo.create({
      orderNo: this.generateOrderNo(),
      userId: null,
      guestEmail: this.deriveGuestEmail(input.contact),
      status: 'pending',
      paymentStatus: 'unpaid',
      totalAmount: input.depositAmount,
      paymentMethod: 'deposit',
      shippingAddr: {
        recipientName: input.name,
        street: 'Interpreting deposit request',
        city: input.city,
        state: input.city,
        postalCode: '000000',
        country: 'China',
        phone: input.contact,
        serviceDate: input.serviceDate,
        supportMode: input.supportMode,
        groupSize: input.groupSize ?? '',
        routeOrNeed: input.routeOrNeed ?? '',
        currency: input.currency ?? 'SGD',
        serviceType: 'interpreting-deposit',
      },
    });

    const saved = await this.orderRepo.save(order);

    // Create Stripe PaymentIntent if configured, otherwise sandbox
    let stripeClientSecret: string;
    if (this.isStripeEnabled) {
      const pi = await this.stripe!.paymentIntents.create({
        amount: Math.round(input.depositAmount * 100),
        currency: (input.currency ?? 'sgd').toLowerCase(),
        metadata: { orderNo: saved.orderNo, orderId: saved.id, type: 'interpreting-deposit' },
        automatic_payment_methods: { enabled: true },
      });
      stripeClientSecret = pi.client_secret!;
    } else {
      stripeClientSecret = `pi_sandbox_${saved.orderNo}_secret_${uuidv4().slice(0, 8)}`;
    }

    return {
      orderId: saved.id,
      orderNo: saved.orderNo,
      totalAmount: saved.totalAmount,
      currency: input.currency ?? 'SGD',
      status: saved.status,
      paymentStatus: saved.paymentStatus,
      stripeClientSecret,
    };
  }

  /**
   * Stripe webhook 回调入口。
   * 当 STRIPE_WEBHOOK_SECRET 配置时验证签名，否则直接解析 body。
   */
  async handleStripeWebhook(signature: string, rawBody: Buffer) {
    let event: any;
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (this.isStripeEnabled && webhookSecret) {
      try {
        event = this.stripe!.webhooks.constructEvent(
          rawBody,
          signature,
          webhookSecret,
        );
      } catch (err) {
        throw new BadRequestException(`Webhook signature verification failed: ${err}`);
      }
    } else {
      // Sandbox mode: parse raw body directly
      try {
        event = JSON.parse(rawBody.toString());
      } catch {
        event = { type: 'unknown', data: {} };
      }
    }

    const eventType = event.type ?? 'unknown';
    const data = event?.data?.object ?? {};
    const orderNo: string | undefined =
      data.metadata?.orderNo ?? data.metadata?.order_no;
    const paymentId: string | undefined = data.id;

    if (eventType === 'payment_intent.succeeded' && orderNo) {
      await this.markPaid(orderNo, paymentId ?? `sandbox_${uuidv4()}`);
      return {
        received: true,
        event: eventType,
        status: 'processed',
        orderNo,
      };
    }

    if (eventType === 'payment_intent.payment_failed' && orderNo) {
      const reason: string | undefined =
        data.last_payment_error?.message ?? 'Payment failed';
      await this.markPaymentFailed(orderNo, reason);
      return {
        received: true,
        event: eventType,
        status: 'processed',
        orderNo,
      };
    }

    return { received: true, event: eventType, status: 'acknowledged' };
  }

  /**
   * 支付成功：把订单标记为已支付，并把履约状态从 pending 推进到 confirmed。
   * idempotent：重复调用同一个 orderNo 不会重复推进。
   */
  async markPaid(orderNo: string, paymentId: string): Promise<Order> {
    // Retry mechanism for potential race conditions or lock acquisition failures
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await this.orderRepo.manager.transaction(async (manager) => {
          const order = await manager.findOne(Order, {
            where: { orderNo },
            lock: { mode: 'pessimistic_write' },
          });

          if (!order) {
            throw new NotFoundException(`Order "${orderNo}" not found`);
          }

          if (order.paymentStatus === 'paid') {
            return order; // Idempotent
          }

          order.paymentStatus = 'paid';
          order.paymentId = paymentId;
          order.paidAt = new Date();
          order.paymentFailureReason = null;

          if (order.status === 'pending') {
            order.status = 'confirmed';
          }

          return await manager.save(Order, order);
        });
      } catch (error) {
        if (error instanceof NotFoundException) throw error;
        if (attempt === 3) throw error;
        // Wait before retrying (exponential backoff)
        await new Promise(res => setTimeout(res, 50 * Math.pow(2, attempt)));
      }
    }
    // Unreachable — the loop always returns or throws on attempt 3
    throw new Error('markPaid: exhausted retries');
  }

  async markPaymentFailed(orderNo: string, reason?: string): Promise<Order> {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await this.orderRepo.manager.transaction(async (manager) => {
          const order = await manager.findOne(Order, {
            where: { orderNo },
            lock: { mode: 'pessimistic_write' },
          });

          if (!order) {
            throw new NotFoundException(`Order "${orderNo}" not found`);
          }

          if (order.paymentStatus === 'failed') {
            return order; // Idempotent
          }

          order.paymentStatus = 'failed';
          order.paymentFailureReason = reason ?? 'Unknown';
          return await manager.save(Order, order);
        });
      } catch (error) {
        if (error instanceof NotFoundException) throw error;
        if (attempt === 3) throw error;
        await new Promise(res => setTimeout(res, 50 * Math.pow(2, attempt)));
      }
    }
    throw new Error('markPaymentFailed: exhausted retries');
  }

  /** @deprecated 旧接口，仅供向后兼容；推荐用 markPaid */
  async confirmOrder(orderNo: string, paymentId: string) {
    return this.markPaid(orderNo, paymentId);
  }

  // ── Admin ──

  async findAllAdmin(
    page = 1,
    limit = 20,
    status?: OrderStatus,
    paymentStatus?: PaymentStatus,
  ) {
    const qb = this.orderRepo.createQueryBuilder('o');
    if (status) qb.andWhere('o.status = :status', { status });
    if (paymentStatus)
      qb.andWhere('o.paymentStatus = :paymentStatus', { paymentStatus });

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('o.createdAt', 'DESC')
      .getManyAndCount();

    return { data: items, total, page: +page, pageSize: +limit };
  }

  async findByIdAdmin(id: string) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  /**
   * 管理员手动推进「履约状态」。
   * 不支持直接通过这个端点改 paymentStatus（避免误操作），
   * 但 cancelled 是合法的兜底操作。
   */
  async updateStatusAdmin(id: string, next: OrderStatus) {
    return this.orderRepo.manager.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!order) throw new NotFoundException(`Order ${id} not found`);

      const allowed = ORDER_STATUS_TRANSITIONS[order.status] ?? [];
      if (!allowed.includes(next)) {
        throw new BadRequestException(
          `Cannot transition from "${order.status}" to "${next}"`,
        );
      }

      order.status = next;
      return manager.save(Order, order);
    });
  }

  async shipOrder(id: string, trackingNo?: string) {
    return this.orderRepo.manager.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!order) throw new NotFoundException(`Order ${id} not found`);

      // 必须支付完成 + 已 confirmed 才允许发货
      if (order.paymentStatus !== 'paid') {
        throw new BadRequestException('Cannot ship: order is not paid');
      }
      if (order.status !== 'confirmed') {
        throw new BadRequestException(
          `Cannot ship: order status is "${order.status}", expected "confirmed"`,
        );
      }

      order.status = 'shipped';
      order.trackingNo = trackingNo ?? null;
      return manager.save(Order, order);
    });
  }

  async refundOrder(id: string, reason?: string) {
    return this.orderRepo.manager.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!order) throw new NotFoundException(`Order ${id} not found`);

      if (order.paymentStatus !== 'paid') {
        throw new BadRequestException(
          'Only paid orders can be refunded',
        );
      }

      order.paymentStatus = 'refunded';
      order.refundReason = reason ?? null;
      // 履约状态保留（用于历史追溯）；如果还没发货，把履约也置为 cancelled
      if (order.status === 'confirmed') {
        order.status = 'cancelled';
      }
      return manager.save(Order, order);
    });
  }

  private generateOrderNo(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `LT${timestamp}${random}`;
  }

  private deriveGuestEmail(contact: string): string {
    const trimmed = contact.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return trimmed;
    }

    const safe = trimmed.replace(/[^a-zA-Z0-9]/g, '').slice(0, 18) || 'guest';
    return `${safe.toLowerCase()}@lingtour.local`;
  }
}
