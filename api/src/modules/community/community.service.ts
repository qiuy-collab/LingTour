import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityPost } from './entities/community-post.entity';
import { UpsertCommunityPostDto } from './dto/upsert-community-post.dto';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(CommunityPost)
    private readonly postRepo: Repository<CommunityPost>,
  ) {}

  async getPublicPosts(query: {
    channel?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const qb = this.postRepo
      .createQueryBuilder('p')
      .where('p.status = :status', { status: 'published' });

    if (query.channel) {
      qb.andWhere('p.channel = :channel', { channel: query.channel });
    }
    if (query.q) {
      qb.andWhere('p.title::text ILIKE :q OR p.excerpt::text ILIKE :q', {
        q: `%${query.q}%`,
      });
    }

    const [items, total] = await qb
      .orderBy('p.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async getPublicPostById(id: string) {
    const post = await this.postRepo.findOne({
      where: { id, status: 'published' },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async listAdmin(query: { status?: string; channel?: string; q?: string; page?: number; limit?: number }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const where: Record<string, any> = {};
    if (query.status) where.status = query.status;
    if (query.channel) where.channel = query.channel;
    if (query.q) {
      const [items, total] = await this.postRepo
        .createQueryBuilder('p')
        .where(where)
        .andWhere('p.title::text ILIKE :q OR p.excerpt::text ILIKE :q', {
          q: `%${query.q}%`,
        })
        .orderBy('p.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();
      return { items, total, page, limit };
    }
    const [items, total] = await this.postRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async getAdminById(id: string) {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async create(dto: UpsertCommunityPostDto) {
    const post = this.postRepo.create({
      channel: dto.channel,
      status: dto.status ?? 'published',
      user: dto.user,
      title: dto.title,
      excerpt: dto.excerpt,
      tags: dto.tags ?? [],
      image: dto.image ?? null,
      location: dto.location ?? '',
      route: dto.route ?? '',
      mood: dto.mood ?? '',
      likes: dto.likes ?? 0,
      comments: dto.comments ?? 0,
      saves: dto.saves ?? 0,
    });
    return this.postRepo.save(post);
  }

  async update(id: string, dto: UpsertCommunityPostDto) {
    const post = await this.getAdminById(id);
    Object.assign(post, dto);
    return this.postRepo.save(post);
  }

  async updateStatus(id: string, status: string) {
    const post = await this.getAdminById(id);
    post.status = status;
    return this.postRepo.save(post);
  }

  async toggleFeatured(id: string, featured: boolean) {
    const post = await this.getAdminById(id);
    (post as any).featured = featured;
    return this.postRepo.save(post);
  }

  async remove(id: string) {
    const post = await this.getAdminById(id);
    await this.postRepo.remove(post);
    return { deleted: true };
  }
}
