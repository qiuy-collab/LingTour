import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  Order,
  type OrderStatus,
  type PaymentStatus,
} from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { v4 as uuidv4 } from 'uuid';
import { NotificationsService } from '../notifications/notifications.service';
import { BookingSubmission } from '../interpreting/entities/booking-submission.entity';
import { StoreProduct } from '../shop/entities/store-product.entity';

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
    @InjectRepository(StoreProduct)
    private readonly productRepo: Repository<StoreProduct>,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
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
    if (!dto.guestEmail) {
      throw new BadRequestException('Contact email is required');
    }
    if (!dto.items.length) {
      throw new BadRequestException('At least one order item is required');
    }

    const quantities = new Map<string, number>();
    for (const item of dto.items) {
      quantities.set(
        item.productId,
        (quantities.get(item.productId) ?? 0) + item.quantity,
      );
    }

    const products = await this.productRepo.find({
      where: {
        id: In([...quantities.keys()]),
        published: true,
      },
    });
    if (products.length !== quantities.size) {
      throw new BadRequestException('One or more products are unavailable');
    }

    const currencies = new Set(products.map((product) => product.currency));
    if (currencies.size !== 1) {
      throw new BadRequestException('All order items must use one currency');
    }
    const currency = [...currencies][0].toUpperCase();
    const items = products.map((product) => {
      const quantity = quantities.get(product.id)!;
      if (product.stock < quantity) {
        throw new BadRequestException(
          `Insufficient stock for product "${product.slug}"`,
        );
      }
      return {
        productId: product.id,
        productName: product.name.en || product.name.zh,
        productImage: product.image,
        quantity,
        unitPrice: Number(product.price),
      };
    });

    const subtotalCents = items.reduce(
      (sum, item) => sum + Math.round(item.unitPrice * 100) * item.quantity,
      0,
    );
    const handlingCents = Math.max(800, Math.round(subtotalCents * 0.06));
    const totalCents = subtotalCents + handlingCents;

    const checkout = await this.orderRepo.manager.transaction(
      async (manager) => {
        const order = manager.create(Order, {
          orderNo: this.generateOrderNo(),
          userId: null,
          guestEmail: dto.guestEmail,
          status: 'pending',
          paymentStatus: 'unpaid',
          items,
          subtotal: subtotalCents / 100,
          handlingAmount: handlingCents / 100,
          totalAmount: totalCents / 100,
          currency,
          orderType: 'shop',
          paymentMethod: dto.paymentMethod ?? 'stripe',
          shippingAddr: dto.shippingAddress as unknown as Record<string, any>,
        });
        const saved = await manager.save(Order, order);

        let stripeClientSecret: string;
        if (this.isStripeEnabled) {
          const paymentIntent = await this.stripe!.paymentIntents.create(
            {
              amount: totalCents,
              currency: currency.toLowerCase(),
              metadata: {
                orderNo: saved.orderNo,
                orderId: saved.id,
                type: 'shop',
              },
              automatic_payment_methods: { enabled: true },
            },
            { idempotencyKey: `shop-order:${saved.id}` },
          );
          if (!paymentIntent.client_secret) {
            throw new BadRequestException(
              'Stripe checkout could not be created',
            );
          }
          saved.stripePaymentIntentId = paymentIntent.id;
          await manager.save(Order, saved);
          stripeClientSecret = paymentIntent.client_secret;
        } else {
          stripeClientSecret = `pi_sandbox_${saved.orderNo}_secret_${uuidv4().slice(0, 8)}`;
        }

        return { saved, stripeClientSecret };
      },
    );

    await this.notificationsService.notifyStaff({
      type: 'order',
      title: `新订单 ${checkout.saved.orderNo}`,
      body: `金额 ${currency} ${Number(checkout.saved.totalAmount).toFixed(2)}，请及时确认付款与履约信息。`,
      resourceType: 'order',
      resourceId: checkout.saved.id,
      link: `/admin/orders/${checkout.saved.id}`,
    });

    return {
      orderId: checkout.saved.id,
      orderNo: checkout.saved.orderNo,
      subtotal: checkout.saved.subtotal,
      handlingAmount: checkout.saved.handlingAmount,
      totalAmount: checkout.saved.totalAmount,
      currency,
      status: checkout.saved.status,
      paymentStatus: checkout.saved.paymentStatus,
      stripeClientSecret: checkout.stripeClientSecret,
    };
  }

  async createInterpretingDeposit(
    input: {
      bookingSubmissionId: string;
      name: string;
      contact: string;
      city: string;
      serviceDate: string;
      supportMode: string;
      groupSize?: string | null;
      routeOrNeed?: string | null;
      depositAmount: number;
      currency?: string;
    },
    manager: EntityManager,
  ) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!this.isStripeEnabled || !webhookSecret) {
      throw new BadRequestException(
        'Deposit payment is temporarily unavailable',
      );
    }

    const currency = (input.currency ?? 'SGD').toUpperCase();
    const order = manager.create(Order, {
      orderNo: this.generateOrderNo(),
      userId: null,
      guestEmail: this.deriveGuestEmail(input.contact),
      status: 'pending',
      paymentStatus: 'unpaid',
      totalAmount: input.depositAmount,
      paymentMethod: 'stripe',
      bookingSubmissionId: input.bookingSubmissionId,
      orderType: 'interpreting_deposit',
      currency,
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
        currency,
        serviceType: 'interpreting-deposit',
      },
    });

    const saved = await manager.save(Order, order);
    const pi = await this.stripe!.paymentIntents.create(
      {
        amount: Math.round(input.depositAmount * 100),
        currency: currency.toLowerCase(),
        metadata: {
          orderNo: saved.orderNo,
          orderId: saved.id,
          bookingSubmissionId: input.bookingSubmissionId,
          type: 'interpreting-deposit',
        },
        automatic_payment_methods: { enabled: true },
      },
      { idempotencyKey: `interpreting-deposit:${saved.id}` },
    );

    if (!pi.client_secret) {
      throw new BadRequestException('Stripe checkout could not be created');
    }

    saved.stripePaymentIntentId = pi.id;
    await manager.save(Order, saved);

    return {
      orderId: saved.id,
      orderNo: saved.orderNo,
      totalAmount: saved.totalAmount,
      currency,
      status: saved.status,
      paymentStatus: saved.paymentStatus,
      stripeClientSecret: pi.client_secret,
    };
  }

  /**
   * Stripe webhook callback. Payment state changes require both configured
   * Stripe credentials and a valid signature over the original raw body.
   */
  async handleStripeWebhook(signature: string, rawBody?: Buffer) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!this.isStripeEnabled || !webhookSecret || !signature || !rawBody) {
      throw new BadRequestException('Stripe webhook is not configured');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe!.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(
        `Webhook signature verification failed: ${err}`,
      );
    }

    if (
      event.type !== 'payment_intent.succeeded' &&
      event.type !== 'payment_intent.payment_failed'
    ) {
      return { received: true, event: event.type, status: 'acknowledged' };
    }

    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const order = await this.orderRepo.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });
    if (!order) {
      throw new NotFoundException('PaymentIntent is not linked to an order');
    }

    this.verifyPaymentIntent(order, paymentIntent);

    if (event.type === 'payment_intent.succeeded') {
      await this.markVerifiedPaymentPaid(paymentIntent);
    } else {
      await this.markPaymentFailed(
        order.orderNo,
        paymentIntent.last_payment_error?.message ?? 'Payment failed',
      );
    }

    return {
      received: true,
      event: event.type,
      status: 'processed',
      orderNo: order.orderNo,
    };
  }

  private verifyPaymentIntent(
    order: Order,
    paymentIntent: Stripe.PaymentIntent,
  ): void {
    const expectedAmount = Math.round(Number(order.totalAmount) * 100);
    const receivedAmount = paymentIntent.amount_received || paymentIntent.amount;
    const expectedCurrency = order.currency.toLowerCase();

    if (
      paymentIntent.metadata.orderId !== order.id ||
      paymentIntent.metadata.orderNo !== order.orderNo
    ) {
      throw new BadRequestException('PaymentIntent metadata does not match order');
    }
    if (
      order.orderType === 'interpreting_deposit' &&
      (!order.bookingSubmissionId ||
        paymentIntent.metadata.type !== 'interpreting-deposit' ||
        paymentIntent.metadata.bookingSubmissionId !== order.bookingSubmissionId)
    ) {
      throw new BadRequestException(
        'PaymentIntent metadata does not match interpreting booking',
      );
    }
    if (receivedAmount !== expectedAmount) {
      throw new BadRequestException('PaymentIntent amount does not match order');
    }
    if (paymentIntent.currency.toLowerCase() !== expectedCurrency) {
      throw new BadRequestException('PaymentIntent currency does not match order');
    }
  }

  private async markVerifiedPaymentPaid(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<Order> {
    return this.orderRepo.manager.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { stripePaymentIntentId: paymentIntent.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!order) {
        throw new NotFoundException('PaymentIntent is not linked to an order');
      }

      this.verifyPaymentIntent(order, paymentIntent);
      if (order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.paymentId = paymentIntent.id;
        order.paidAt = new Date();
        order.paymentFailureReason = null;
        if (order.status === 'pending') order.status = 'confirmed';
        await manager.save(Order, order);
      }

      if (order.orderType === 'interpreting_deposit') {
        if (!order.bookingSubmissionId) {
          throw new BadRequestException('Deposit order is not linked to a booking');
        }
        const booking = await manager.findOne(BookingSubmission, {
          where: { id: order.bookingSubmissionId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!booking) {
          throw new NotFoundException('Deposit booking is not linked to an order');
        }
        if (booking.status === 'deposit_pending') {
          booking.status = 'deposit_paid';
          await manager.save(BookingSubmission, booking);
        }
      }

      return order;
    });
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
        await new Promise((res) => setTimeout(res, 50 * Math.pow(2, attempt)));
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

          if (
            order.paymentStatus === 'failed' ||
            order.paymentStatus === 'paid' ||
            order.paymentStatus === 'refunded'
          ) {
            return order;
          }

          order.paymentStatus = 'failed';
          order.paymentFailureReason = reason ?? 'Unknown';
          return await manager.save(Order, order);
        });
      } catch (error) {
        if (error instanceof NotFoundException) throw error;
        if (attempt === 3) throw error;
        await new Promise((res) => setTimeout(res, 50 * Math.pow(2, attempt)));
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
        throw new BadRequestException('Only paid orders can be refunded');
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
