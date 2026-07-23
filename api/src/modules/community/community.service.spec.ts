import { CommunityService } from './community.service';

describe('CommunityService', () => {
  it('orders saved posts by the mapped entity property', async () => {
    const queryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    const saveRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    const service = new CommunityService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      saveRepo as never,
      {} as never,
    );

    await service.listSavedPosts('staff-user-id');

    expect(queryBuilder.orderBy).toHaveBeenCalledWith('save.createdAt', 'DESC');
    expect(queryBuilder.getMany).toHaveBeenCalled();
  });
});
