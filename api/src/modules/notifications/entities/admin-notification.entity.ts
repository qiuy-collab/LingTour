import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export const ADMIN_NOTIFICATION_TYPES = [
  'order',
  'booking',
  'review',
  'system',
  'audit',
] as const;

export type AdminNotificationType = (typeof ADMIN_NOTIFICATION_TYPES)[number];

@Entity('admin_notifications')
@Index(['recipientId', 'read', 'createdAt'])
export class AdminNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', name: 'recipient_id' })
  recipientId: string;

  @Column({ type: 'varchar', length: 20 })
  type: AdminNotificationType;

  @Column({ type: 'varchar', length: 180 })
  title: string;

  @Column({ type: 'varchar', length: 600, default: '' })
  body: string;

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @Column({ type: 'varchar', length: 40, name: 'resource_type', default: '' })
  resourceType: string;

  @Column({ type: 'varchar', length: 100, name: 'resource_id', default: '' })
  resourceId: string;

  @Column({ type: 'varchar', length: 300, default: '' })
  link: string;

  @Index()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
