import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import {
  AdminNotification,
  type AdminNotificationType,
} from './entities/admin-notification.entity';

export interface StaffNotificationInput {
  type: AdminNotificationType;
  title: string;
  body?: string;
  resourceType?: string;
  resourceId?: string;
  link?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(AdminNotification)
    private readonly notificationRepo: Repository<AdminNotification>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(
    recipientId: string,
    query: { page?: number; pageSize?: number; type?: string; read?: boolean },
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const qb = this.notificationRepo
      .createQueryBuilder('notification')
      .where('notification.recipientId = :recipientId', { recipientId });

    if (query.type) {
      qb.andWhere('notification.type = :type', { type: query.type });
    }
    if (typeof query.read === 'boolean') {
      qb.andWhere('notification.read = :read', { read: query.read });
    }

    const [data, total] = await qb
      .orderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { data, total, page, pageSize };
  }

  async getUnreadCount(recipientId: string) {
    const count = await this.notificationRepo.count({
      where: { recipientId, read: false },
    });
    return { count };
  }

  async markAsRead(recipientId: string, id: string) {
    const notification = await this.findOwned(recipientId, id);
    if (!notification.read) {
      notification.read = true;
      await this.notificationRepo.save(notification);
    }
    return notification;
  }

  async markAllAsRead(recipientId: string) {
    const result = await this.notificationRepo.update(
      { recipientId, read: false },
      { read: true },
    );
    return { updated: result.affected ?? 0 };
  }

  async remove(recipientId: string, id: string) {
    const notification = await this.findOwned(recipientId, id);
    await this.notificationRepo.remove(notification);
    return { deleted: true };
  }

  async notifyStaff(input: StaffNotificationInput) {
    const staff = await this.userRepo.find({
      where: { role: In(['admin', 'editor']), status: 'active' },
      select: { id: true },
    });
    if (!staff.length) return { created: 0 };

    await this.notificationRepo.save(
      staff.map((user) =>
        this.notificationRepo.create({
          recipientId: user.id,
          type: input.type,
          title: input.title,
          body: input.body ?? '',
          resourceType: input.resourceType ?? '',
          resourceId: input.resourceId ?? '',
          link: input.link ?? '',
        }),
      ),
    );
    return { created: staff.length };
  }

  private async findOwned(recipientId: string, id: string) {
    const notification = await this.notificationRepo.findOne({
      where: { id, recipientId },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }
}
