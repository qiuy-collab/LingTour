import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

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

  async findAllAdmin(page = 1, pageSize = 20, keyword?: string, status?: string) {
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

    const items = await Promise.all(users.map((user) => this.toManagedUser(user)));
    return { items, total, page, pageSize };
  }

  async findManagedById(id: string) {
    return this.toManagedUser(await this.findByIdOrFail(id));
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
  ): Promise<User> {
    const user = this.userRepository.create({
      email,
      passwordHash,
      role,
      name: name ?? undefined,
    } as Partial<User>);
    return this.userRepository.save(user);
  }

  private async toManagedUser(user: User) {
    const [ordersCount, bookingsCount] = await Promise.all([
      this.userRepository.manager
        .query('SELECT COUNT(*)::int AS count FROM orders WHERE user_id = $1', [user.id])
        .then((rows) => Number(rows?.[0]?.count ?? 0))
        .catch(() => 0),
      this.userRepository.manager
        .query('SELECT COUNT(*)::int AS count FROM booking_submissions WHERE contact = $1', [user.email])
        .then((rows) => Number(rows?.[0]?.count ?? 0))
        .catch(() => 0),
    ]);

    return {
      id: user.id,
      name: user.name || user.email.split('@')[0],
      email: user.email,
      avatar: '',
      locale: 'zh',
      createdAt: user.createdAt,
      status: user.status || 'active',
      bookingsCount,
      ordersCount,
      favorites: [],
      role: user.role,
    };
  }
}
