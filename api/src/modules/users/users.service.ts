import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserFavorite } from './entities/user-favorite.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateStaffAccountDto } from './dto/create-staff-account.dto';
import { UpdateStaffAccountDto } from './dto/update-staff-account.dto';
import * as bcrypt from 'bcrypt';

interface ManagedUserStats {
  ordersCount: number;
  bookingsCount: number;
  dispatchCount: number;
  photoDispatchCount: number;
  latestDispatchAt: string | Date | null;
  latestDispatchTitle: Record<string, string> | string | null;
  favorites: UserFavorite[];
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserFavorite)
    private readonly favoriteRepository: Repository<UserFavorite>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findAllAdmin(
    page = 1,
    pageSize = 20,
    keyword?: string,
    status?: string,
  ) {
    const qb = this.userRepository
      .createQueryBuilder('u')
      .where('u.role = :travelerRole', { travelerRole: 'traveler' });
    if (keyword) {
      qb.andWhere('(u.email ILIKE :keyword OR u.name ILIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    }
    if (status) {
      qb.andWhere('u.status = :status', { status });
    }

    const [users, total] = await qb
      .orderBy('u.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const statsMap = await this.loadManagedUserStats(users);
    const items = await Promise.all(
      users.map((user) => this.toManagedUser(user, statsMap.get(user.id))),
    );
    return { data: items, total, page, pageSize };
  }

  async findAllStaff(
    page = 1,
    pageSize = 20,
    keyword?: string,
    role?: 'admin' | 'editor',
    status?: 'active' | 'banned',
  ) {
    const safePage = Math.max(Number(page) || 1, 1);
    const safePageSize = Math.min(Math.max(Number(pageSize) || 20, 1), 100);
    const qb = this.userRepository
      .createQueryBuilder('u')
      .where('u.role IN (:...staffRoles)', {
        staffRoles: ['admin', 'editor'],
      });

    if (keyword?.trim()) {
      qb.andWhere('(u.email ILIKE :keyword OR u.name ILIKE :keyword)', {
        keyword: `%${keyword.trim()}%`,
      });
    }
    if (role) qb.andWhere('u.role = :role', { role });
    if (status) qb.andWhere('u.status = :status', { status });

    const [accounts, total] = await qb
      .orderBy('u.role', 'ASC')
      .addOrderBy('u.createdAt', 'ASC')
      .skip((safePage - 1) * safePageSize)
      .take(safePageSize)
      .getManyAndCount();

    return {
      data: accounts.map((account) => this.toStaffAccount(account)),
      total,
      page: safePage,
      pageSize: safePageSize,
    };
  }

  async createStaff(dto: CreateStaffAccountDto) {
    const email = dto.email.trim().toLowerCase();
    if (await this.findByEmail(email)) {
      throw new ConflictException('This email is already in use');
    }

    const account = this.userRepository.create({
      email,
      passwordHash: await bcrypt.hash(dto.password, 12),
      role: dto.role,
      status: dto.status ?? 'active',
      name: dto.name.trim(),
      provider: 'staff',
      memberSince: new Date().toISOString().slice(0, 10),
    });
    return this.toStaffAccount(await this.userRepository.save(account));
  }

  async updateStaff(id: string, dto: UpdateStaffAccountDto, actorId: string) {
    const account = await this.findStaffByIdOrFail(id);
    const nextRole = dto.role ?? account.role;
    const nextStatus = dto.status ?? account.status;

    if (id === actorId && (nextRole !== 'admin' || nextStatus !== 'active')) {
      throw new BadRequestException(
        'You cannot remove your own active administrator access',
      );
    }
    await this.assertAdminContinuity(account, nextRole, nextStatus);

    if (dto.email) {
      const email = dto.email.trim().toLowerCase();
      const duplicate = await this.findByEmail(email);
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('This email is already in use');
      }
      account.email = email;
    }
    if (dto.name !== undefined) account.name = dto.name.trim();
    if (dto.role !== undefined) account.role = dto.role;
    if (dto.status !== undefined) account.status = dto.status;
    if (dto.password)
      account.passwordHash = await bcrypt.hash(dto.password, 12);

    return this.toStaffAccount(await this.userRepository.save(account));
  }

  async deleteStaff(id: string, actorId: string) {
    if (id === actorId) {
      throw new BadRequestException('You cannot delete your own account');
    }
    const account = await this.findStaffByIdOrFail(id);
    await this.assertAdminContinuity(account, 'traveler', 'banned');

    try {
      await this.userRepository.delete(id);
    } catch {
      throw new ConflictException(
        'This account has linked records and cannot be deleted; disable it instead',
      );
    }
    return { deleted: true, id };
  }

  async findManagedById(id: string) {
    return this.toManagedUser(await this.findByIdOrFail(id));
  }

  async updateProfile(id: string, payload: UpdateProfileDto) {
    const user = await this.findByIdOrFail(id);
    if (payload.email !== undefined) {
      const email = payload.email.trim().toLowerCase();
      const duplicate = await this.findByEmail(email);
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('This email is already in use');
      }
      user.email = email;
    }
    Object.assign(user, this.normalizeProfilePayload(payload, user));
    const saved = await this.userRepository.save(user);
    return this.toManagedUser(saved);
  }

  async getProfileById(id: string) {
    const user = await this.findByIdOrFail(id);
    return this.toProfile(user);
  }

  async touchProvider(id: string, provider: string) {
    const user = await this.findByIdOrFail(id);
    user.provider = provider;
    if (!user.memberSince) {
      user.memberSince = user.createdAt.toISOString().slice(0, 10);
    }
    return this.userRepository.save(user);
  }

  async updateStatus(id: string, status: 'active' | 'banned') {
    const user = await this.findByIdOrFail(id);
    user.status = status;
    const saved = await this.userRepository.save(user);
    return this.toManagedUser(saved);
  }

  async create(
    email: string,
    passwordHash: string,
    role: 'admin' | 'editor' | 'traveler' = 'traveler',
    name?: string,
    overrides: Partial<User> = {},
  ): Promise<User> {
    const user = this.userRepository.create({
      email,
      passwordHash,
      role,
      name: name ?? undefined,
      ...overrides,
    } as Partial<User>);
    return this.userRepository.save(user);
  }

  private async findStaffByIdOrFail(id: string) {
    const account = await this.findByIdOrFail(id);
    if (account.role !== 'admin' && account.role !== 'editor') {
      throw new NotFoundException('Staff account not found');
    }
    return account;
  }

  private async assertAdminContinuity(
    current: User,
    nextRole: User['role'],
    nextStatus: User['status'],
  ) {
    const removesActiveAdmin =
      current.role === 'admin' &&
      current.status === 'active' &&
      (nextRole !== 'admin' || nextStatus !== 'active');
    if (!removesActiveAdmin) return;

    const activeAdmins = await this.userRepository.count({
      where: { role: 'admin', status: 'active' },
    });
    if (activeAdmins <= 1) {
      throw new ConflictException(
        'At least one active administrator is required',
      );
    }
  }

  private toStaffAccount(account: User) {
    return {
      id: account.id,
      email: account.email,
      name: account.name || account.email.split('@')[0],
      role: account.role,
      status: account.status,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  private async toManagedUser(user: User, stats?: ManagedUserStats | null) {
    const resolvedStats = stats ??
      (await this.loadManagedUserStats([user])).get(user.id) ?? {
        ordersCount: 0,
        bookingsCount: 0,
        dispatchCount: 0,
        photoDispatchCount: 0,
        latestDispatchAt: null,
        latestDispatchTitle: null,
        favorites: [],
      };

    return {
      id: user.id,
      name: user.name || user.email.split('@')[0],
      email: user.email,
      // Both keys are returned for backwards compatibility with admin clients
      // that already read `avatar`. Frontend reads `avatarUrl`.
      avatar: user.avatarUrl || '',
      avatarUrl: user.avatarUrl || '',
      locale: 'en',
      createdAt: user.createdAt,
      status: user.status || 'active',
      bookingsCount: resolvedStats.bookingsCount,
      ordersCount: resolvedStats.ordersCount,
      favorites: resolvedStats.favorites.map((f) => ({
        id: f.id,
        type: f.targetType,
        targetId: f.targetId,
        title: f.targetTitle,
        image: f.targetImage,
        savedAt: f.createdAt,
      })),
      role: user.role,
      provider: user.provider || '',
      country: user.country || '',
      homeBase: user.homeBase || '',
      travelStyle: user.travelStyle || '',
      memberSince: user.memberSince || '',
      bio: user.bio || '',
      profileVisibility: user.profileVisibility || 'public',
      dispatchCount: resolvedStats.dispatchCount,
      photoDispatchCount: resolvedStats.photoDispatchCount,
      latestDispatchAt: resolvedStats.latestDispatchAt ?? null,
      latestDispatchTitle: this.normalizeLatestDispatchTitle(
        resolvedStats.latestDispatchTitle,
      ),
    };
  }

  private async toProfile(user: User) {
    const managed = await this.toManagedUser(user);
    return {
      ...managed,
      accountId: this.formatAccountId(user.id),
    };
  }

  private formatAccountId(userId: string) {
    const compact = userId.replace(/-/g, '').slice(0, 8).toUpperCase();
    return `LT-${compact}`;
  }

  private normalizeLatestDispatchTitle(
    title: Record<string, string> | string | null,
  ) {
    if (!title) {
      return null;
    }
    if (typeof title === 'string') {
      return title;
    }
    return title.en ?? title.zh ?? null;
  }

  private async loadManagedUserStats(users: User[]) {
    const stats = new Map<string, ManagedUserStats>();

    for (const user of users) {
      stats.set(user.id, {
        ordersCount: 0,
        bookingsCount: 0,
        dispatchCount: 0,
        photoDispatchCount: 0,
        latestDispatchAt: null,
        latestDispatchTitle: null,
        favorites: [],
      });
    }

    if (!users.length) {
      return stats;
    }

    const userIds = users.map((user) => user.id);
    const emails = users.map((user) => user.email).filter(Boolean);
    const manager = this.userRepository.manager;

    const [
      orderRows,
      bookingRows,
      dispatchRows,
      latestDispatchRows,
      favoriteRows,
    ] = await Promise.all([
      manager.query(
        'SELECT user_id AS "userId", COUNT(*)::int AS count FROM orders WHERE user_id = ANY($1::uuid[]) GROUP BY user_id',
        [userIds],
      ),
      manager.query(
        'SELECT contact, COUNT(*)::int AS count FROM booking_submissions WHERE contact = ANY($1::text[]) GROUP BY contact',
        [emails],
      ),
      manager.query(
        `
            SELECT
              COALESCE(user_id::text, user_email) AS "ownerKey",
              COUNT(*)::int AS "dispatchCount",
              COUNT(*) FILTER (WHERE COALESCE(image, '') <> '')::int AS "photoDispatchCount",
              MAX(created_at) AS "latestDispatchAt"
            FROM community_posts
            WHERE user_id = ANY($1::uuid[]) OR user_email = ANY($2::text[])
            GROUP BY COALESCE(user_id::text, user_email)
          `,
        [userIds, emails],
      ),
      manager.query(
        `
            SELECT DISTINCT ON (COALESCE(user_id::text, user_email))
              COALESCE(user_id::text, user_email) AS "ownerKey",
              title
            FROM community_posts
            WHERE user_id = ANY($1::uuid[]) OR user_email = ANY($2::text[])
            ORDER BY COALESCE(user_id::text, user_email), created_at DESC
          `,
        [userIds, emails],
      ),
      manager.query(
        `
            SELECT user_id AS "userId", id, target_type AS "targetType", target_id AS "targetId",
                   target_title AS "targetTitle", target_image AS "targetImage", created_at AS "createdAt"
            FROM user_favorites
            WHERE user_id = ANY($1::uuid[])
            ORDER BY user_id ASC, created_at DESC
          `,
        [userIds],
      ),
    ]);

    for (const row of orderRows as Array<{ userId: string; count: number }>) {
      const current = stats.get(row.userId);
      if (current) {
        current.ordersCount = Number(row.count ?? 0);
      }
    }

    for (const row of bookingRows as Array<{
      contact: string;
      count: number;
    }>) {
      const user = users.find((item) => item.email === row.contact);
      if (user) {
        const current = stats.get(user.id);
        if (current) {
          current.bookingsCount = Number(row.count ?? 0);
        }
      }
    }

    for (const row of dispatchRows as Array<{
      ownerKey: string;
      dispatchCount: number;
      photoDispatchCount: number;
      latestDispatchAt: string | Date | null;
    }>) {
      const user =
        users.find((item) => item.id === row.ownerKey) ??
        users.find((item) => item.email === row.ownerKey);
      if (user) {
        const current = stats.get(user.id);
        if (current) {
          current.dispatchCount = Number(row.dispatchCount ?? 0);
          current.photoDispatchCount = Number(row.photoDispatchCount ?? 0);
          current.latestDispatchAt = row.latestDispatchAt ?? null;
        }
      }
    }

    for (const row of latestDispatchRows as Array<{
      ownerKey: string;
      title: Record<string, string> | string;
    }>) {
      const user =
        users.find((item) => item.id === row.ownerKey) ??
        users.find((item) => item.email === row.ownerKey);
      if (user) {
        const current = stats.get(user.id);
        if (current) {
          current.latestDispatchTitle = row.title;
        }
      }
    }

    const favoritesByUserId = new Map<string, UserFavorite[]>();
    for (const row of favoriteRows as Array<{
      userId: string;
      id: string;
      targetType: 'route' | 'city' | 'product';
      targetId: string;
      targetTitle: string;
      targetImage: string;
      createdAt: Date;
    }>) {
      const list = favoritesByUserId.get(row.userId) ?? [];
      list.push({
        id: row.id,
        userId: row.userId,
        targetType: row.targetType,
        targetId: row.targetId,
        targetTitle: row.targetTitle,
        targetImage: row.targetImage,
        createdAt: row.createdAt,
      });
      favoritesByUserId.set(row.userId, list);
    }

    for (const user of users) {
      const current = stats.get(user.id);
      if (current) {
        current.favorites = (favoritesByUserId.get(user.id) ?? []).slice(0, 20);
      }
    }

    return stats;
  }

  private normalizeProfilePayload(
    payload: UpdateProfileDto,
    fallback?: User,
  ): Partial<User> {
    return {
      name: payload.name?.trim() ?? fallback?.name ?? undefined,
      avatarUrl: payload.avatarUrl?.trim() ?? fallback?.avatarUrl ?? '',
      country: payload.country?.trim().toUpperCase() ?? fallback?.country ?? '',
      homeBase: payload.homeBase?.trim() ?? fallback?.homeBase ?? '',
      travelStyle: payload.travelStyle?.trim() ?? fallback?.travelStyle ?? '',
      bio: payload.bio?.trim() ?? fallback?.bio ?? '',
      profileVisibility:
        payload.profileVisibility ?? fallback?.profileVisibility ?? 'public',
    };
  }

  // ── Favorites (Personal Vault) ──

  async getFavorites(userId: string) {
    const items = await this.favoriteRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return { items };
  }

  async addFavorite(
    userId: string,
    data: {
      targetType: 'route' | 'city' | 'product';
      targetId: string;
      targetTitle: string;
      targetImage: string;
    },
  ) {
    // Upsert: if already exists, just return it
    const existing = await this.favoriteRepository.findOne({
      where: { userId, targetType: data.targetType, targetId: data.targetId },
    });
    if (existing) return existing;

    const fav = this.favoriteRepository.create({
      userId,
      targetType: data.targetType,
      targetId: data.targetId,
      targetTitle: data.targetTitle,
      targetImage: data.targetImage,
    });
    return this.favoriteRepository.save(fav);
  }

  async removeFavorite(
    userId: string,
    targetType: 'route' | 'city' | 'product',
    targetId: string,
  ) {
    await this.favoriteRepository.delete({ userId, targetType, targetId });
    return { removed: true };
  }
}
