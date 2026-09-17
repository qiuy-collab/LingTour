import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  Order,
  type OrderStatus,
  type PaymentStatus,
} from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { NotificationsService } from '../notifications/notifications.service';
import { BookingSubmission } from '../interpreting/entities/booking-submission.entity';
import { StoreProduct } from '../shop/entities/store-product.entity';
import { SettingsService } from '../settings/settings.service';

type PayPalOrderResponse = {
  id: string;
  status?: string;
  links?: Array<{ href: string; rel: string; method?: string }>;
};

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
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(StoreProduct)
    private readonly productRepo: Repository<StoreProduct>,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
    private readonly settingsService: SettingsService,
  ) {}

  private get paypalBaseUrl(): string {
    return (
      this.configService.get<string>('PAYPAL_API_BASE_URL') ??
      'https://api-m.sandbox.paypal.com'
    );
  }

  private get isPayPalEnabled(): boolean {
    return Boolean(
      this.configService.get<string>('PAYPAL_CLIENT_ID') &&
      this.configService.get<string>('PAYPAL_CLIENT_SECRET'),
    );
  }

  private createPublicStatusToken() {
    const token = randomBytes(32).toString('base64url');
    return { token, hash: this.hashPublicStatusToken(token) };
  }

  private hashPublicStatusToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private publicStatusTokenMatches(order: Order, token: string) {
    if (!order.publicStatusTokenHash || !token) return false;
    const supplied = Buffer.from(this.hashPublicStatusToken(token), 'hex');
    const expected = Buffer.from(order.publicStatusTokenHash, 'hex');
    return (
      supplied.length === expected.length && timingSafeEqual(supplied, expected)
    );
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

    // P2-7: the handling floor is admin-configurable (minor units); the 6%
    // variable component stays a code-level rule. Invalid values fall back
    // to the historical default of 800.
    const settings = await this.settingsService.getAdminSettings();
    const configuredFloor = Number(settings.payload?.handlingFeeCents);
    const handlingFloorCents =
      Number.isFinite(configuredFloor) && configuredFloor >= 0
        ? Math.round(configuredFloor)
        : 800;

    const checkout = await this.orderRepo.manager.transaction(
      async (manager) => {
        const products = await manager.find(StoreProduct, {
          where: {
            id: In([...quantities.keys()]),
            published: true,
          },
          lock: { mode: 'pessimistic_write' },
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
          product.stock -= quantity;
          return {
            productId: product.id,
            productName: product.name,
            productImage: product.image,
            quantity,
            unitPrice: Number(product.price),
          };
        });
        await manager.save(StoreProduct, products);

        const subtotalCents = items.reduce(
          (sum, item) => sum + Math.round(item.unitPrice * 100) * item.quantity,
          0,
        );
        const handlingCents = Math.max(
          handlingFloorCents,
          Math.round(subtotalCents * 0.06),
        );
        const totalCents = subtotalCents + handlingCents;
        const publicStatusToken = this.createPublicStatusToken();
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
          paymentMethod: 'paypal',
          publicStatusTokenHash: publicStatusToken.hash,
          stockReserved: true,
          shippingAddr: dto.shippingAddress as unknown as Record<string, any>,
        });
        const saved = await manager.save(Order, order);

        let paypalOrderId: string | null = null;
        let paypalApprovalUrl: string | null = null;

        const paypalOrder = await this.createPayPalOrder(
          saved,
          totalCents,
          publicStatusToken.token,
        );
        paypalOrderId = paypalOrder.id;
        paypalApprovalUrl =
          paypalOrder.links?.find((link) => link.rel === 'approve')?.href ??
          null;
        if (!paypalOrderId || !paypalApprovalUrl) {
          throw new BadRequestException('PayPal checkout could not be created');
        }
        saved.paymentMethod = 'paypal';
        saved.paymentId = paypalOrderId;
        await manager.save(Order, saved);

        return {
          saved,
          paypalOrderId,
          paypalApprovalUrl,
          paymentMethod: 'paypal' as const,
          currency,
          publicStatusToken: publicStatusToken.token,
        };
      },
    );

    await this.notificationsService.notifyStaff({
      type: 'order',
      title: `新订单 ${checkout.saved.orderNo}`,
      body: `金额 ${checkout.currency} ${Number(checkout.saved.totalAmount).toFixed(2)}，请及时确认付款与履约信息。`,
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
      currency: checkout.currency,
      status: checkout.saved.status,
      paymentStatus: checkout.saved.paymentStatus,
      paymentMethod: checkout.paymentMethod,
      paypalOrderId: checkout.paypalOrderId,
      paypalApprovalUrl: checkout.paypalApprovalUrl,
      publicStatusToken: checkout.publicStatusToken,
    };
  }

  async findPublicStatus(orderNo: string, token: string) {
    const order = await this.orderRepo.findOne({ where: { orderNo } });
    if (!order || !this.publicStatusTokenMatches(order, token)) {
      throw new NotFoundException('Order status is unavailable');
    }

    return {
      orderNo: order.orderNo,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      currency: order.currency,
      orderType: order.orderType,
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
    if (!this.isPayPalEnabled) {
      throw new BadRequestException(
        'Deposit payment is temporarily unavailable',
      );
    }

    const currency = (input.currency ?? 'SGD').toUpperCase();
    const publicStatusToken = this.createPublicStatusToken();
    const order = manager.create(Order, {
      orderNo: this.generateOrderNo(),
      userId: null,
      guestEmail: this.deriveGuestEmail(input.contact),
      status: 'pending',
      paymentStatus: 'unpaid',
      totalAmount: input.depositAmount,
      paymentMethod: 'paypal',
      bookingSubmissionId: input.bookingSubmissionId,
      orderType: 'interpreting_deposit',
      currency,
      publicStatusTokenHash: publicStatusToken.hash,
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
    const paypalOrder = await this.createPayPalOrder(
      saved,
      Math.round(input.depositAmount * 100),
      publicStatusToken.token,
    );
    const paypalApprovalUrl =
      paypalOrder.links?.find((link) => link.rel === 'approve')?.href ?? null;
    if (!paypalOrder.id || !paypalApprovalUrl) {
      throw new BadRequestException('PayPal checkout could not be created');
    }

    saved.paymentId = paypalOrder.id;
    await manager.save(Order, saved);

    return {
      orderId: saved.id,
      orderNo: saved.orderNo,
      totalAmount: saved.totalAmount,
      currency,
      status: saved.status,
      paymentStatus: saved.paymentStatus,
      paypalOrderId: paypalOrder.id,
      paypalApprovalUrl,
      publicStatusToken: publicStatusToken.token,
    };
  }

  private async getPayPalAccessToken(): Promise<string> {
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      throw new BadRequestException('PayPal checkout is not configured');
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64',
    );
    const response = await fetch(`${this.paypalBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    if (!response.ok) {
      throw new BadRequestException('PayPal authentication failed');
    }
    const data = (await response.json()) as { access_token?: string };
    if (!data.access_token) {
      throw new BadRequestException('PayPal authentication failed');
    }
    return data.access_token;
  }

  private async createPayPalOrder(
    order: Order,
    totalCents: number,
    publicStatusToken: string,
  ): Promise<PayPalOrderResponse> {
    if (!this.isPayPalEnabled) {
      throw new BadRequestException('PayPal checkout is not configured');
    }

    const accessToken = await this.getPayPalAccessToken();
    const siteUrl =
      this.configService.get<string>('SITE_ORIGIN') ??
      this.configService.get<string>('PUBLIC_SITE_ORIGIN') ??
      'http://localhost:3000';
    const response = await fetch(`${this.paypalBaseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: order.orderNo,
            custom_id: order.id,
            amount: {
              currency_code: order.currency,
              value: (totalCents / 100).toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: 'Culvoy Guangdong',
          user_action: 'PAY_NOW',
          return_url: `${siteUrl}/checkout/success?orderNo=${encodeURIComponent(order.orderNo)}&provider=paypal&statusToken=${encodeURIComponent(publicStatusToken)}`,
          cancel_url: `${siteUrl}/checkout?paypal=cancelled&orderNo=${encodeURIComponent(order.orderNo)}`,
        },
      }),
    });
    if (!response.ok) {
      throw new BadRequestException('PayPal checkout could not be created');
    }
    return (await response.json()) as PayPalOrderResponse;
  }

  async capturePayPalOrder(paypalOrderId: string) {
    const existingOrder = await this.orderRepo.findOne({
      where: { paymentId: paypalOrderId },
    });
    if (existingOrder?.paymentStatus === 'paid') {
      return existingOrder;
    }

    const accessToken = await this.getPayPalAccessToken();
    const response = await fetch(
      `${this.paypalBaseUrl}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    if (!response.ok) {
      throw new BadRequestException('PayPal payment could not be captured');
    }

    const data = (await response.json()) as {
      id: string;
      status?: string;
      purchase_units?: Array<{
        reference_id?: string;
        custom_id?: string;
        payments?: {
          captures?: Array<{
            id: string;
            status?: string;
            amount?: { currency_code?: string; value?: string };
          }>;
        };
      }>;
    };
    const unit = data.purchase_units?.[0];
    const capture = unit?.payments?.captures?.[0];
    if (data.status !== 'COMPLETED' || capture?.status !== 'COMPLETED') {
      throw new BadRequestException('PayPal payment is not complete');
    }
    if (!unit?.reference_id || !unit.custom_id || !capture.id) {
      throw new BadRequestException('PayPal payment is missing order metadata');
    }

    const order = await this.orderRepo.findOne({
      where: { id: unit.custom_id },
    });
    if (
      !order ||
      order.orderNo !== unit.reference_id ||
      order.paymentId !== data.id
    ) {
      throw new BadRequestException(
        'PayPal payment is not linked to this order',
      );
    }
    if (capture.amount?.currency_code !== order.currency) {
      throw new BadRequestException(
        'PayPal payment currency does not match order',
      );
    }
    if (Number(capture.amount?.value) !== Number(order.totalAmount)) {
      throw new BadRequestException(
        'PayPal payment amount does not match order',
      );
    }

    return this.markPaid(order.orderNo, capture.id);
  }

  /**
   * 押金单支付完成后，把绑定的讲解预订从 deposit_pending 推进到 deposit_paid。
   * 幂等：仅在 booking 仍处于 deposit_pending 时推进。
   */
  private async promoteDepositBooking(
    manager: EntityManager,
    order: Order,
  ): Promise<void> {
    if (order.orderType !== 'interpreting_deposit') return;
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

  /**
   * 支付成功：把订单标记为已支付，并把履约状态从 pending 推进到 confirmed。
   * 押金单同时推进绑定的讲解预订状态。
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
            await this.promoteDepositBooking(manager, order);
            return order; // Idempotent
          }

          // Late payment: the expiry sweep cancelled this order, but the
          // customer did complete PayPal after all. Re-activate fulfilment
          // and try to re-reserve the stock that the sweep released.
          if (order.status === 'cancelled' && order.paymentStatus === 'failed') {
            order.status = 'confirmed';
            await this.reReserveStockAfterLatePayment(manager, order);
          }

          order.paymentStatus = 'paid';
          order.paymentId = paymentId;
          order.paidAt = new Date();
          order.paymentFailureReason = null;
          order.stockReserved = false;

          if (order.status === 'pending') {
            order.status = 'confirmed';
          }

          const saved = await manager.save(Order, order);
          await this.promoteDepositBooking(manager, order);
          return saved;
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
          await this.releaseReservedStock(manager, order);
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

      if (next === 'cancelled') {
        await this.releaseReservedStock(manager, order);
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
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    if (order.paymentStatus !== 'paid') {
      throw new BadRequestException('Only paid orders can be refunded');
    }
    if (order.paymentMethod !== 'paypal' || !order.paymentId) {
      throw new BadRequestException(
        'Order has no PayPal capture that can be refunded',
      );
    }

    // The gateway call deliberately happens OUTSIDE the transaction: the
    // money is actually returned at PayPal first, then the local state
    // flips inside a short locked transaction. A refund that only changed
    // the local row would leave the customer without their money while the
    // back office shows "refunded" (report P1-3).
    await this.refundPayPalCapture(
      order.paymentId,
      order.totalAmount,
      order.currency,
      order.orderNo,
    );

    return this.orderRepo.manager.transaction(async (manager) => {
      const locked = await manager.findOne(Order, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!locked) throw new NotFoundException(`Order ${id} not found`);
      if (locked.paymentStatus === 'refunded') {
        return locked; // concurrent refund won the race
      }
      if (locked.paymentStatus !== 'paid') {
        throw new BadRequestException('Only paid orders can be refunded');
      }

      locked.paymentStatus = 'refunded';
      locked.refundReason = reason ?? null;
      // 履约状态保留（用于历史追溯）；如果还没发货，把履约也置为 cancelled
      if (locked.status === 'confirmed') {
        locked.status = 'cancelled';
      }
      return manager.save(Order, locked);
    });
  }

  /**
   * Full refund of a captured PayPal payment. Tolerates replays: if PayPal
   * reports the capture was already refunded we treat the refund as done
   * so the local state can converge.
   */
  private async refundPayPalCapture(
    captureId: string,
    totalAmount: number,
    currency: string,
    orderNo: string,
  ): Promise<{ refundId?: string }> {
    const accessToken = await this.getPayPalAccessToken();
    const response = await fetch(
      `${this.paypalBaseUrl}/v2/payments/captures/${encodeURIComponent(captureId)}/refund`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: {
            currency_code: currency,
            value: Number(totalAmount).toFixed(2),
          },
          invoice_id: `${orderNo}-refund`,
        }),
      },
    );

    if (response.ok) {
      const data = (await response.json()) as { id?: string };
      return { refundId: data.id };
    }

    const error = (await response.json().catch(() => null)) as {
      details?: Array<{ issue?: string }>;
    } | null;
    const issue = error?.details?.[0]?.issue ?? '';
    if (issue === 'CAPTURE_ALREADY_REFUNDED') {
      return {};
    }
    throw new BadRequestException(
      'PayPal refund could not be completed. Check the capture status in PayPal and retry.',
    );
  }

  private generateOrderNo(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    // crypto random instead of Math.random (report P3): 4 bytes of entropy
    const random = randomBytes(4).toString('hex').toUpperCase();
    return `LT${timestamp}${random}`;
  }

  private async releaseReservedStock(
    manager: EntityManager,
    order: Order,
  ): Promise<void> {
    if (!order.stockReserved) return;

    for (const item of order.items ?? []) {
      await manager.increment(
        StoreProduct,
        { id: item.productId },
        'stock',
        item.quantity,
      );
    }
    order.stockReserved = false;
  }

  /**
   * A late payment re-activates an order the expiry sweep already cancelled.
   * The sweep released the reserved stock, so try to reserve it again; if
   * the stock is gone (or the product was removed) leave the flag off and
   * let fulfilment handle the shortfall manually.
   */
  private async reReserveStockAfterLatePayment(
    manager: EntityManager,
    order: Order,
  ): Promise<void> {
    let allReserved = true;
    for (const item of order.items ?? []) {
      const product = await manager.findOne(StoreProduct, {
        where: { id: item.productId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!product || product.stock < item.quantity) {
        allReserved = false;
        continue;
      }
      product.stock -= item.quantity;
      await manager.save(StoreProduct, product);
    }
    order.stockReserved = allReserved;
  }

  private deriveGuestEmail(contact: string): string {
    const trimmed = contact.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return trimmed;
    }

    const safe = trimmed.replace(/[^a-zA-Z0-9]/g, '').slice(0, 18) || 'guest';
    return `${safe.toLowerCase()}@culvoy.local`;
  }
}
