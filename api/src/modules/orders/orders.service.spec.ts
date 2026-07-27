jest.mock('uuid', () => ({ v4: () => 'test-uuid' }));

import { BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { BookingSubmission } from '../interpreting/entities/booking-submission.entity';

const makeOrder = (overrides: Partial<Order> = {}): Order =>
  ({
    id: 'order-id',
    orderNo: 'LT123',
    totalAmount: 120,
    currency: 'SGD',
    status: 'pending',
    paymentStatus: 'unpaid',
    paymentId: null,
    paymentFailureReason: null,
    paidAt: null,
    stripePaymentIntentId: 'pi_123',
    bookingSubmissionId: 'booking-id',
    orderType: 'interpreting_deposit',
    ...overrides,
  }) as Order;

const makePaymentIntent = (overrides: Record<string, any> = {}) => ({
  id: 'pi_123',
  amount_received: 12000,
  currency: 'sgd',
  metadata: {
    orderId: 'order-id',
    orderNo: 'LT123',
    bookingSubmissionId: 'booking-id',
    type: 'interpreting-deposit',
  },
  ...overrides,
});

describe('OrdersService shop checkout', () => {
  it('prices from published products and persists immutable item snapshots', async () => {
    const product = {
      id: 'product-id',
      slug: 'tea-bowl',
      name: { en: 'Tea Bowl', zh: '茶碗' },
      image: '/uploads/products/tea-bowl.webp',
      price: 32,
      currency: 'SGD',
      stock: 5,
    };
    const productRepo = { find: jest.fn().mockResolvedValue([product]) };
    const manager = {
      create: jest.fn((_entity, value) => ({ ...value, id: 'order-id' })),
      save: jest.fn(async (_entity, value) => value),
    };
    const orderRepo = {
      manager: { transaction: jest.fn((work) => work(manager)) },
    };
    const notifications = { notifyStaff: jest.fn() };
    const service = new OrdersService(
      orderRepo as any,
      productRepo as any,
      { get: jest.fn().mockReturnValue(undefined) } as any,
      notifications as any,
    );

    const result = await service.createOrder({
      guestEmail: 'guest@example.com',
      items: [{ productId: 'product-id', quantity: 2 }],
      shippingAddress: {
        recipientName: 'Guest',
        street: '1 Main Street',
        city: 'Singapore',
        state: 'Singapore',
        postalCode: '123456',
        country: 'Singapore',
      },
    });

    expect(manager.create).toHaveBeenCalledWith(
      Order,
      expect.objectContaining({
        items: [
          expect.objectContaining({
            productId: 'product-id',
            productName: 'Tea Bowl',
            quantity: 2,
            unitPrice: 32,
          }),
        ],
        subtotal: 64,
        handlingAmount: 8,
        totalAmount: 72,
        currency: 'SGD',
      }),
    );
    expect(result.totalAmount).toBe(72);
  });

  it('rejects unavailable products instead of trusting request prices', async () => {
    const service = new OrdersService(
      { manager: { transaction: jest.fn() } } as any,
      { find: jest.fn().mockResolvedValue([]) } as any,
      { get: jest.fn().mockReturnValue(undefined) } as any,
      {} as any,
    );

    await expect(
      service.createOrder({
        guestEmail: 'guest@example.com',
        items: [{ productId: 'missing-product', quantity: 1 }],
        shippingAddress: {} as any,
      }),
    ).rejects.toThrow('One or more products are unavailable');
  });
});

describe('OrdersService interpreting deposits', () => {
  it('refuses deposit checkout when verified Stripe webhooks are unavailable', async () => {
    const service = new OrdersService(
      {} as any,
      {} as any,
      { get: jest.fn().mockReturnValue(undefined) } as any,
      {} as any,
    );

    await expect(
      service.createInterpretingDeposit(
        {
          bookingSubmissionId: 'booking-id',
          name: 'Guest',
          contact: 'guest@example.com',
          city: 'Zhanjiang',
          serviceDate: '2026-08-01',
          supportMode: 'City companion support',
          depositAmount: 120,
        },
        {} as any,
      ),
    ).rejects.toThrow('Deposit payment is temporarily unavailable');
  });

  it('persists the binding and Stripe id with immutable booking metadata', async () => {
    const paymentIntentsCreate = jest.fn().mockResolvedValue({
      id: 'pi_123',
      client_secret: 'pi_123_secret_test',
    });
    const manager = {
      create: jest.fn((_entity, value) => value),
      save: jest.fn(async (_entity, value) => value),
    };
    const service = new OrdersService(
      {} as any,
      {} as any,
      {
        get: jest.fn((key: string) =>
          key === 'STRIPE_SECRET_KEY' ? 'sk_test' : 'whsec_test',
        ),
      } as any,
      {} as any,
    );
    (service as any).stripe = { paymentIntents: { create: paymentIntentsCreate } };
    jest.spyOn(Date, 'now').mockReturnValue(1);
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    await service.createInterpretingDeposit(
      {
        bookingSubmissionId: 'booking-id',
        name: 'Guest',
        contact: 'guest@example.com',
        city: 'Zhanjiang',
        serviceDate: '2026-08-01',
        supportMode: 'City companion support',
        depositAmount: 120,
      },
      manager as any,
    );

    expect(manager.create).toHaveBeenCalledWith(
      Order,
      expect.objectContaining({
        bookingSubmissionId: 'booking-id',
        orderType: 'interpreting_deposit',
        currency: 'SGD',
      }),
    );
    expect(paymentIntentsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 12000,
        currency: 'sgd',
        metadata: expect.objectContaining({
          bookingSubmissionId: 'booking-id',
          type: 'interpreting-deposit',
        }),
      }),
      expect.objectContaining({ idempotencyKey: expect.stringContaining('interpreting-deposit:') }),
    );
    expect(manager.save).toHaveBeenLastCalledWith(
      Order,
      expect.objectContaining({ stripePaymentIntentId: 'pi_123' }),
    );
  });

  it('rejects unsigned webhook payloads instead of parsing them as sandbox events', async () => {
    const service = new OrdersService(
      {} as any,
      {} as any,
      { get: jest.fn().mockReturnValue(undefined) } as any,
      {} as any,
    );

    await expect(
      service.handleStripeWebhook('', Buffer.from('{}')),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a signed payment whose amount does not match the bound order', async () => {
    const order = makeOrder();
    const repository = { findOne: jest.fn().mockResolvedValue(order) };
    const service = new OrdersService(
      repository as any,
      {} as any,
      {
        get: jest.fn((key: string) =>
          key === 'STRIPE_SECRET_KEY' ? 'sk_test' : 'whsec_test',
        ),
      } as any,
      {} as any,
    );
    (service as any).stripe = {
      webhooks: {
        constructEvent: jest.fn().mockReturnValue({
          type: 'payment_intent.succeeded',
          data: { object: makePaymentIntent({ amount_received: 100 }) },
        }),
      },
    };

    await expect(
      service.handleStripeWebhook('signature', Buffer.from('{}')),
    ).rejects.toThrow('PaymentIntent amount does not match order');
  });

  it('does not downgrade a paid order when a late failure event arrives', async () => {
    const order = makeOrder({ paymentStatus: 'paid', status: 'confirmed' });
    const manager = {
      findOne: jest.fn().mockResolvedValue(order),
      save: jest.fn(),
    };
    const service = new OrdersService(
      { manager: { transaction: jest.fn((work) => work(manager)) } } as any,
      {} as any,
      { get: jest.fn().mockReturnValue(undefined) } as any,
      {} as any,
    );

    const result = await service.markPaymentFailed('LT123', 'late failure');

    expect(result.paymentStatus).toBe('paid');
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('atomically marks the bound order and booking paid after verified success', async () => {
    const order = makeOrder();
    const booking = { id: 'booking-id', status: 'deposit_pending' } as BookingSubmission;
    const manager = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce(order)
        .mockResolvedValueOnce(booking),
      save: jest.fn(async (_entity, value) => value),
    };
    const repository = {
      findOne: jest.fn().mockResolvedValue(order),
      manager: { transaction: jest.fn((work) => work(manager)) },
    };
    const service = new OrdersService(
      repository as any,
      {} as any,
      {
        get: jest.fn((key: string) =>
          key === 'STRIPE_SECRET_KEY' ? 'sk_test' : 'whsec_test',
        ),
      } as any,
      {} as any,
    );
    (service as any).stripe = {
      webhooks: {
        constructEvent: jest.fn().mockReturnValue({
          type: 'payment_intent.succeeded',
          data: { object: makePaymentIntent() },
        }),
      },
    };

    await service.handleStripeWebhook('signature', Buffer.from('{}'));

    expect(order.paymentStatus).toBe('paid');
    expect(order.status).toBe('confirmed');
    expect(booking.status).toBe('deposit_paid');
    expect(manager.save).toHaveBeenCalledWith(Order, order);
    expect(manager.save).toHaveBeenCalledWith(BookingSubmission, booking);
  });
});
