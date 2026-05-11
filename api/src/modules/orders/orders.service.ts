import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  /**
   * Create a pending order.
   * In production, this would also:
   * 1. Validate product stock
   * 2. Calculate total from item prices
   * 3. Create Stripe PaymentIntent / Checkout Session
   * 4. Return client_secret for frontend
   */
  async createOrder(dto: CreateOrderDto) {
    // Validate guest checkout has email
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
      totalAmount,
      paymentMethod: dto.paymentMethod ?? 'stripe',
      shippingAddr: dto.shippingAddress as unknown as Record<string, any>,
    });

    const saved = await this.orderRepo.save(order);

    // Return mock Stripe client_secret for P1/P2
    return {
      orderId: saved.id,
      orderNo: saved.orderNo,
      totalAmount: saved.totalAmount,
      status: saved.status,
      // In production: real Stripe PaymentIntent client_secret
      stripeClientSecret: `pi_mock_${saved.orderNo}_secret_${uuidv4().slice(0, 8)}`,
    };
  }

  /**
   * Handle Stripe webhook callback.
   * In production: verify webhook signature, update order status,
   * deduct inventory, send confirmation email.
   */
  async handleStripeWebhook(signature: string, rawBody: Buffer) {
    // TODO P2: Verify Stripe webhook signature
    // const event = stripe.webhooks.constructEvent(
    //   rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET
    // );

    // Mock webhook processing
    // Parse event type from raw body
    let eventType = 'unknown';
    try {
      const body = JSON.parse(rawBody.toString());
      eventType = body.type ?? 'unknown';
    } catch {}

    if (eventType === 'payment_intent.succeeded') {
      // Update order status to 'paid'
      // Deduct inventory
      // Send email
      return {
        received: true,
        event: 'payment_intent.succeeded',
        status: 'processed',
      };
    }

    return { received: true, event: eventType, status: 'acknowledged' };
  }

  /**
   * Update order status after payment confirmation.
   */
  async confirmOrder(orderNo: string, paymentId: string) {
    const order = await this.orderRepo.findOne({ where: { orderNo } });
    if (!order) {
      throw new NotFoundException(`Order "${orderNo}" not found`);
    }

    order.status = 'paid';
    order.paymentId = paymentId;
    return this.orderRepo.save(order);
  }

  // ── Admin ──

  async findAllAdmin(page = 1, limit = 20, status?: string) {
    const qb = this.orderRepo.createQueryBuilder('o');
    if (status) {
      qb.andWhere('o.status = :status', { status });
    }
    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('o.createdAt', 'DESC')
      .getManyAndCount();

    return { items, total, page: +page, size: +limit };
  }

  async findByIdAdmin(id: string) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  private generateOrderNo(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `LT${timestamp}${random}`;
  }
}
