import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
    const qb = this.userRepository.createQueryBuilder('u');
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

    const items = await Promise.all(
      users.map((user) => this.toManagedUser(user)),
    );
    return { items, total, page, pageSize };
  }

  async findManagedById(id: string) {
    return this.toManagedUser(await this.findByIdOrFail(id));
  }

  async updateProfile(id: string, payload: UpdateProfileDto) {
    const user = await this.findByIdOrFail(id);
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
    role: 'admin' | 'editor' = 'editor',
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

  private async toManagedUser(user: User) {
    const [ordersCount, bookingsCount, dispatchStats] = await Promise.all([
      this.userRepository.manager
        .query('SELECT COUNT(*)::int AS count FROM orders WHERE user_id = $1', [
          user.id,
        ])
        .then((rows) => Number(rows?.[0]?.count ?? 0))
        .catch(() => 0),
      this.userRepository.manager
        .query(
          'SELECT COUNT(*)::int AS count FROM booking_submissions WHERE contact = $1',
          [user.email],
        )
        .then((rows) => Number(rows?.[0]?.count ?? 0))
        .catch(() => 0),
      this.userRepository.manager
        .query(
          `
            SELECT
              COUNT(*)::int AS dispatch_count,
              COUNT(*) FILTER (WHERE COALESCE(image, '') <> '')::int AS photo_dispatch_count,
              MAX(created_at) AS latest_dispatch_at
            FROM community_posts
            WHERE user_id = $1 OR (COALESCE(user_email, '') <> '' AND user_email = $2)
          `,
          [user.id, user.email],
        )
        .then((rows) => rows?.[0] ?? {})
        .catch(() => ({})),
    ]);

    const latestDispatchTitle = await this.userRepository.manager
      .query(
        `
          SELECT title
          FROM community_posts
          WHERE user_id = $1 OR (COALESCE(user_email, '') <> '' AND user_email = $2)
          ORDER BY created_at DESC
          LIMIT 1
        `,
        [user.id, user.email],
      )
      .then((rows) => rows?.[0]?.title ?? null)
      .catch(() => null);

    return {
      id: user.id,
      name: user.name || user.email.split('@')[0],
      email: user.email,
      avatar: user.avatarUrl || '',
      locale: 'zh',
      createdAt: user.createdAt,
      status: user.status || 'active',
      bookingsCount,
      ordersCount,
      favorites: [],
      role: user.role,
      provider: user.provider || '',
      country: user.country || '',
      homeBase: user.homeBase || '',
      travelStyle: user.travelStyle || '',
      memberSince: user.memberSince || '',
      bio: user.bio || '',
      profileVisibility: user.profileVisibility || 'public',
      dispatchCount: Number(dispatchStats.dispatch_count ?? 0),
      photoDispatchCount: Number(dispatchStats.photo_dispatch_count ?? 0),
      latestDispatchAt: dispatchStats.latest_dispatch_at ?? null,
      latestDispatchTitle:
        latestDispatchTitle?.en ??
        latestDispatchTitle?.zh ??
        latestDispatchTitle ??
        null,
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

  private normalizeProfilePayload(
    payload: UpdateProfileDto,
    fallback?: User,
  ): Partial<User> {
    return {
      name: payload.name?.trim() ?? fallback?.name ?? undefined,
      avatarUrl: payload.avatarUrl?.trim() ?? fallback?.avatarUrl ?? '',
      country: payload.country?.trim() ?? fallback?.country ?? '',
      homeBase: payload.homeBase?.trim() ?? fallback?.homeBase ?? '',
      travelStyle: payload.travelStyle?.trim() ?? fallback?.travelStyle ?? '',
      bio: payload.bio?.trim() ?? fallback?.bio ?? '',
      profileVisibility:
        payload.profileVisibility ?? fallback?.profileVisibility ?? 'public',
    };
  }
}
