import { BadRequestException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

type MockUser = Partial<User> & { id: string; email: string; role: string };

function buildService(options: {
  user?: MockUser;
  activeAdmins?: number;
  savedRoles?: string[];
}) {
  const saved: string[] = options.savedRoles ?? [];
  const countBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(options.activeAdmins ?? 2),
  };
  const userRepository = {
    findOne: jest.fn().mockResolvedValue(options.user ?? null),
    save: jest.fn(async (entity: MockUser) => {
      saved.push(entity.role);
      return entity;
    }),
    createQueryBuilder: jest.fn(() => countBuilder),
    count: jest.fn().mockResolvedValue(options.activeAdmins ?? 2),
    delete: jest.fn().mockResolvedValue(undefined),
    manager: { query: jest.fn().mockResolvedValue([]) },
  };
  const service = new UsersService(
    userRepository as never,
    {} as never,
    {} as never,
  );
  return { service, userRepository, saved };
}

function traveler(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: 'user-1',
    email: 'ravi@example.com',
    name: 'Ravi',
    role: 'traveler',
    status: 'active',
    avatarUrl: '',
    ...overrides,
  } as MockUser;
}

describe('UsersService — coexisting staff and traveler identities', () => {
  it('grants back-office access to an existing traveler without a second account', async () => {
    const { service, saved } = buildService({ user: traveler() });

    const result = await service.setStaffAccess('user-1', 'admin', 'actor-1');

    expect(saved).toEqual(['admin,traveler']);
    expect(result.role).toBe('admin');
    expect(result.roles).toEqual(['admin', 'traveler']);
  });

  it('revokes back-office access but keeps the traveler identity and its records', async () => {
    const { service, userRepository, saved } = buildService({
      user: traveler({ role: 'admin,traveler' }),
    });

    const result = await service.setStaffAccess('user-1', 'none', 'actor-1');

    expect(saved).toEqual(['traveler']);
    expect(result.roles).toEqual(['traveler']);
    // The account row is updated, never deleted.
    expect(userRepository.delete).not.toHaveBeenCalled();
  });

  it('refuses to revoke the acting administrator own access', async () => {
    const { service } = buildService({
      user: traveler({ role: 'admin,traveler' }),
    });

    await expect(
      service.setStaffAccess('user-1', 'none', 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('refuses to strip the last active administrator', async () => {
    const { service } = buildService({
      user: traveler({ role: 'admin,traveler' }),
      activeAdmins: 1,
    });

    await expect(
      service.setStaffAccess('user-1', 'none', 'actor-1'),
    ).rejects.toThrow(ConflictException);
  });

  it('only accepts traveler accounts on the coexistence endpoint', async () => {
    const { service } = buildService({
      user: traveler({ role: 'admin', provider: 'staff' }),
    });

    await expect(
      service.setStaffAccess('user-1', 'editor', 'actor-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('does not delete an account that still holds a traveler identity', async () => {
    const { service, userRepository } = buildService({
      user: traveler({ role: 'admin,traveler' }),
    });

    await expect(service.deleteStaff('user-1', 'actor-1')).rejects.toThrow(
      ConflictException,
    );
    expect(userRepository.delete).not.toHaveBeenCalled();
  });

  it('still deletes a pure staff account', async () => {
    const { service, userRepository } = buildService({
      user: traveler({ role: 'editor', provider: 'staff' }),
    });

    await expect(service.deleteStaff('user-1', 'actor-1')).resolves.toEqual({
      deleted: true,
      id: 'user-1',
    });
    expect(userRepository.delete).toHaveBeenCalledWith('user-1');
  });

  it('matches a multi-role account in the traveler list query', async () => {
    const first = jest.fn().mockReturnThis();
    const andWhere = jest.fn().mockReturnThis();
    const orderBy = jest.fn().mockReturnThis();
    const addOrderBy = jest.fn().mockReturnThis();
    const skip = jest.fn().mockReturnThis();
    const take = jest.fn().mockReturnThis();
    const getManyAndCount = jest.fn().mockResolvedValue([[], 0]);
    const userRepository = {
      createQueryBuilder: jest.fn(() => ({
        where: first,
        andWhere,
        orderBy,
        addOrderBy,
        skip,
        take,
        getManyAndCount,
      })),
      manager: { query: jest.fn().mockResolvedValue([]) },
    };
    const service = new UsersService(
      userRepository as never,
      {} as never,
      {} as never,
    );

    await service.findAllAdmin();

    const [sql, params] = first.mock.calls[0];
    expect(sql).toContain(`(',' || u.role || ',') LIKE`);
    expect(params).toEqual({ travelerRole: '%,traveler,%' });
  });
});