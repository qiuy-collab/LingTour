import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  const queryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };
  const notificationRepo = {
    createQueryBuilder: jest.fn(() => queryBuilder),
    count: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(async (value) => value),
    update: jest.fn(),
    remove: jest.fn(),
    create: jest.fn((value) => value),
  };
  const userRepo = { find: jest.fn() };
  const service = new NotificationsService(
    notificationRepo as any,
    userRepo as any,
  );

  beforeEach(() => jest.clearAllMocks());

  it('always scopes the notification list to the current staff account', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    await service.findAll('staff-1', { page: 1, pageSize: 20, read: false });

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'notification.recipientId = :recipientId',
      { recipientId: 'staff-1' },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'notification.read = :read',
      { read: false },
    );
  });

  it('creates one notification for every active staff account', async () => {
    userRepo.find.mockResolvedValue([{ id: 'admin-1' }, { id: 'editor-1' }]);

    const result = await service.notifyStaff({
      type: 'order',
      title: 'New order',
      resourceId: 'order-1',
    });

    expect(result).toEqual({ created: 2 });
    expect(notificationRepo.save).toHaveBeenCalledWith([
      expect.objectContaining({ recipientId: 'admin-1', type: 'order' }),
      expect.objectContaining({ recipientId: 'editor-1', type: 'order' }),
    ]);
  });

  it('does not allow one staff account to mutate another account notification', async () => {
    notificationRepo.findOne.mockResolvedValue(null);

    await expect(
      service.markAsRead('staff-1', 'notification-2'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
