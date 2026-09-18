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
      { sendTemplated: jest.fn().mockResolvedValue(true) } as never,
    );

    await service.listSavedPosts('staff-user-id');

    expect(queryBuilder.orderBy).toHaveBeenCalledWith('save.createdAt', 'DESC');
    expect(queryBuilder.getMany).toHaveBeenCalled();
  });

  it('notifies the author when the review decision changes', async () => {
    const postRepo = { save: jest.fn(async (value) => value) };
    const mailer = { sendTemplated: jest.fn().mockResolvedValue(true) };
    const service = new CommunityService(
      {} as never,
      postRepo as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      mailer as never,
    );
    jest.spyOn(service as any, 'getAdminById').mockResolvedValue({
      id: 'post-1',
      status: 'pending_review',
      title: 'Morning light at Shamian Island',
      userEmail: 'author@example.com',
      rejectionReason: null,
    });

    await service.updateStatus('post-1', 'published');

    expect(mailer.sendTemplated).toHaveBeenCalledWith(
      'community_post_reviewed',
      'author@example.com',
      expect.objectContaining({
        result: 'Approved',
        postTitle: 'Morning light at Shamian Island',
      }),
      'en',
      { resourceType: 'community_post', resourceId: 'post-1' },
    );
  });

  it('stays silent when the status is saved again unchanged', async () => {
    const postRepo = { save: jest.fn(async (value) => value) };
    const mailer = { sendTemplated: jest.fn().mockResolvedValue(true) };
    const service = new CommunityService(
      {} as never,
      postRepo as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      mailer as never,
    );
    jest.spyOn(service as any, 'getAdminById').mockResolvedValue({
      id: 'post-1',
      status: 'published',
      title: 'Morning light at Shamian Island',
      userEmail: 'author@example.com',
      rejectionReason: null,
    });

    await service.updateStatus('post-1', 'published');

    expect(mailer.sendTemplated).not.toHaveBeenCalled();
  });
});
