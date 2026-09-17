import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { clampPagination } from '../../common/pagination';
import { randomBytes } from 'crypto';
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
    @InjectDataSource()
    private readonly dataSource: DataSource,
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
    pageInput = 1,
    pageSizeInput = 20,
    keyword?: string,
    status?: string,
  ) {
    const { page, limit: pageSize } = clampPagination(pageInput, pageSizeInput, 20, 100);
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

  async updateProfile(
    id: string,
    payload: UpdateProfileDto,
    options: { allowEmailChange?: boolean } = {},
  ) {
    const user = await this.findByIdOrFail(id);
    if (payload.email !== undefined) {
      // Traveler self-service must not change email freely: an unverified
      // change enables the account-takeover chain described in report
      // P2-3 (attacker plants their email, victim later signs in with
      // Google into the attacker's account). Use the code-confirmed flow.
      if (options.allowEmailChange === false) {
        throw new BadRequestException(
          'Email changes must be confirmed with a verification code (POST /auth/me/email/change-request)',
        );
      }
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

  /**
   * Set a new (verified) email for a traveler account. Called only from the
   * code-confirmed email change flow.
   */
  async updateEmail(id: string, newEmail: string) {
    const email = newEmail.trim().toLowerCase();
    const duplicate = await this.findByEmail(email);
    if (duplicate && duplicate.id !== id) {
      throw new ConflictException('This email is already in use');
    }
    const user = await this.findByIdOrFail(id);
    user.email = email;
    try {
      return await this.userRepository.save(user);
    } catch (error) {
      // Concurrent signup could claim the address between the check and save.
      if ((error as { code?: string }).code === '23505') {
        throw new ConflictException('This email is already in use');
      }
      throw error;
    }
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
    // Keep at least one active administrator: banning the last admin through
    // this path would lock every future staff login out of the back office.
    await this.assertAdminContinuity(user, user.role, status);
    user.status = status;
    const saved = await this.userRepository.save(user);
    return this.toManagedUser(saved);
  }

  /**
   * Self-service account deletion for travelers (report P3-12, GDPR/CCPA
   * face). Anonymization-style: every PII field is wiped and the status moves
   * to 'deleted' (all login paths reject anything but 'active'), while the
   * row itself stays so order/financial records keep their user join.
   * Staff accounts cannot self-delete; admins manage them via deleteStaff.
   */
  async deleteTravelerAccount(id: string) {
    const user = await this.findByIdOrFail(id);
    if (user.role !== 'traveler') {
      throw new ForbiddenException(
        'Staff accounts cannot be self-deleted; contact an administrator',
      );
    }
    if (user.status === 'deleted') {
      throw new ConflictException('Account is already deleted');
    }
    user.status = 'deleted';
    // Release the unique email for future signups; .invalid is a reserved
    // TLD (RFC 2606) so the synthetic address can never receive mail.
    user.email = `deleted-${user.id}@deleted.invalid`;
    user.passwordHash = randomBytes(32).toString('hex');
    user.name = null;
    user.avatarUrl = '';
    user.country = '';
    user.homeBase = '';
    user.travelStyle = '';
    user.provider = '';
    user.bio = '';
    user.profileVisibility = 'private';
    await this.userRepository.save(user);
    return { deleted: true };
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
    try {
      return await this.userRepository.save(user);
    } catch (error) {
      // Two concurrent signups with the same address can both pass the
      // duplicate check; surface the unique-constraint violation as 409
      // instead of a raw 500 (report P3).
      if ((error as { code?: string }).code === '23505') {
        throw new ConflictException('This email is already in use');
      }
      throw error;
    }
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
    title: unknown,
  ) {
    if (!title) {
      return null;
    }
    return typeof title === 'string' ? title : null;
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
    // targetId may be a uuid or a slug depending on the caller; verify the
    // target actually exists so the vault cannot be filled with junk
    // references (report P3-13).
    const tableByType = {
      route: 'story_routes',
      city: 'cities',
      product: 'store_products',
    } as const;
    const table = tableByType[data.targetType];
    const target = (await this.dataSource.query(
      `SELECT 1 FROM ${table} WHERE id::text = $1 OR slug = $1 LIMIT 1`,
      [data.targetId],
    )) as unknown[];
    if (!target.length) {
      throw new NotFoundException('Favorite target does not exist');
    }

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
