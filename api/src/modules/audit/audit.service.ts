import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditQueryDto } from './dto/audit-query.dto';

export interface CreateAuditLogDto {
  userId?: string;
  userName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  resourceName?: string;
  details?: Record<string, any>;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changes?: Record<string, { old: any; new: any }>;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  /**
   * Create a single audit log entry.
   * Used by the interceptor and can be called directly by services.
   */
  async log(data: CreateAuditLogDto): Promise<AuditLog> {
    try {
      const entry = this.auditRepo.create({
        userId: data.userId || undefined,
        userName: data.userName || '',
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId || undefined,
        resourceName: data.resourceName || undefined,
        details: data.details || undefined,
        oldValues: data.oldValues || undefined,
        newValues: data.newValues || undefined,
        ip: data.ip || undefined,
        userAgent: data.userAgent || undefined,
      });
      return await this.auditRepo.save(entry);
    } catch (err: any) {
      // Audit logging should never break the main request
      this.logger.warn(`Failed to create audit log: ${err.message}`);
      return undefined as any;
    }
  }

  /**
   * Paginated list with optional filters.
   */
  async findAll(query: AuditQueryDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const qb = this.auditRepo.createQueryBuilder('al');

    // Filters
    if (query.action) {
      qb.andWhere('al.action = :action', { action: query.action });
    }
    if (query.resource) {
      qb.andWhere('al.resource = :resource', { resource: query.resource });
    }
    if (query.userId) {
      qb.andWhere('al.user_id = :userId', { userId: query.userId });
    }
    if (query.startDate) {
      qb.andWhere('al.created_at >= :startDate', {
        startDate: new Date(query.startDate),
      });
    }
    if (query.endDate) {
      qb.andWhere('al.created_at <= :endDate', {
        endDate: new Date(query.endDate),
      });
    }
    if (query.keyword) {
      qb.andWhere(
        '(al.user_name ILIKE :kw OR al.resource_name ILIKE :kw OR al.action ILIKE :kw OR al.resource ILIKE :kw)',
        { kw: `%${query.keyword}%` },
      );
    }

    qb.orderBy('al.created_at', 'DESC');
    qb.skip(skip).take(pageSize);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items,
      total,
      page,
      pageSize,
    };
  }

  /**
   * Single audit log detail.
   */
  async findOne(id: string): Promise<AuditLog> {
    const entry = await this.auditRepo.findOne({ where: { id } });
    if (!entry) {
      throw new NotFoundException(`Audit log #${id} not found`);
    }
    return entry;
  }

  /**
   * Aggregated statistics for the dashboard widget.
   */
  async getStats() {
    const totalRow = await this.auditRepo
      .createQueryBuilder('al')
      .select('COUNT(*)::int', 'total')
      .getRawOne();

    const last7DaysRow = await this.auditRepo
      .createQueryBuilder('al')
      .select('COUNT(*)::int', 'count')
      .where('al.created_at >= NOW() - INTERVAL \'7 days\'')
      .getRawOne();

    const actionBreakdown = await this.auditRepo
      .createQueryBuilder('al')
      .select('al.action', 'action')
      .addSelect('COUNT(*)::int', 'count')
      .groupBy('al.action')
      .orderBy('count', 'DESC')
      .getRawMany();

    const resourceBreakdown = await this.auditRepo
      .createQueryBuilder('al')
      .select('al.resource', 'resource')
      .addSelect('COUNT(*)::int', 'count')
      .groupBy('al.resource')
      .orderBy('count', 'DESC')
      .getRawMany();

    return {
      total: totalRow?.total ?? 0,
      last7Days: last7DaysRow?.count ?? 0,
      actionBreakdown,
      resourceBreakdown,
    };
  }
}
