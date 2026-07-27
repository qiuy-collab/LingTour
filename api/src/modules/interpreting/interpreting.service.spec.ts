jest.mock('uuid', () => ({ v4: () => 'test-order-id' }));

import { InterpretingService } from './interpreting.service';

describe('InterpretingService public profiles', () => {
  it('keeps active profiles without avatars so the frontend can render its fallback', async () => {
    const profiles = [
      { id: 'with-avatar', avatar: '/uploads/interpreting/guide.webp' },
      { id: 'without-avatar', avatar: '' },
    ];
    const modeRepo = { find: jest.fn().mockResolvedValue([]) };
    const profileRepo = { find: jest.fn().mockResolvedValue(profiles) };
    const faqRepo = { find: jest.fn().mockResolvedValue([]) };
    const service = new InterpretingService(
      modeRepo as any,
      profileRepo as any,
      faqRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    const result = await service.getPublicPageData();

    expect(result.profiles).toEqual(profiles);
  });

  it('creates the booking and bound deposit order inside one transaction', async () => {
    const booking = {
      id: 'booking-id',
      status: 'deposit_pending',
      createdAt: new Date('2026-07-27T00:00:00Z'),
    };
    const manager = {
      create: jest.fn((_entity, value) => ({ ...value, id: 'booking-id' })),
      save: jest.fn().mockResolvedValue(booking),
    };
    const dataSource = { transaction: jest.fn((work) => work(manager)) };
    const ordersService = {
      createInterpretingDeposit: jest.fn().mockResolvedValue({
        orderNo: 'LT123',
        totalAmount: 120,
        currency: 'SGD',
        status: 'pending',
        stripeClientSecret: 'pi_123_secret_test',
      }),
    };
    const notificationsService = { notifyStaff: jest.fn() };
    const service = new InterpretingService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      ordersService as any,
      notificationsService as any,
      dataSource as any,
    );

    const result = await service.submitBookingWithDeposit({
      name: 'Guest',
      contact: 'guest@example.com',
      city: 'Zhanjiang',
      serviceDate: '2026-08-01',
      supportMode: 'City companion support',
    });

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(ordersService.createInterpretingDeposit).toHaveBeenCalledWith(
      expect.objectContaining({
        bookingSubmissionId: 'booking-id',
        depositAmount: 120,
      }),
      manager,
    );
    expect(result.bookingId).toBe('booking-id');
  });

  it('does not notify staff when the transactional deposit checkout fails', async () => {
    const notificationsService = { notifyStaff: jest.fn() };
    const service = new InterpretingService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      notificationsService as any,
      {
        transaction: jest.fn().mockRejectedValue(new Error('stripe failed')),
      } as any,
    );

    await expect(
      service.submitBookingWithDeposit({
        name: 'Guest',
        contact: 'guest@example.com',
        city: 'Zhanjiang',
        serviceDate: '2026-08-01',
        supportMode: 'City companion support',
      }),
    ).rejects.toThrow('stripe failed');
    expect(notificationsService.notifyStaff).not.toHaveBeenCalled();
  });
});
