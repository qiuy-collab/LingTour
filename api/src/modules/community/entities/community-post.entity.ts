import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 社区帖子审核状态。
 * - pending_review: 用户提交、待审核（公开发帖默认进入此状态）
 * - published: 审核通过、对外可见
 * - hidden: 审核退回 / 运营隐藏，不对外，但仍保留
 */
export const COMMUNITY_POST_STATUSES = [
  'pending_review',
  'published',
  'hidden',
] as const;

export type CommunityPostStatus = (typeof COMMUNITY_POST_STATUSES)[number];

@Entity('community_posts')
export class CommunityPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  @Index()
  channel: string;

  @Column({ type: 'varchar', length: 30, default: 'published' })
  @Index()
  status: CommunityPostStatus;

  @Column({ type: 'jsonb' })
  user: Record<string, unknown>;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 255, name: 'user_email', default: '' })
  userEmail: string;

  @Column({ type: 'jsonb' })
  title: { en: string; zh: string };

  @Column({ type: 'jsonb' })
  excerpt: { en: string; zh: string };

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  image: string | null;

  @Column({ type: 'varchar', length: 200, default: '' })
  location: string;

  @Column({ type: 'varchar', length: 200, default: '' })
  route: string;

  @Column({ type: 'varchar', length: 120, default: '' })
  mood: string;

  @Column({ type: 'boolean', default: false })
  @Index()
  featured: boolean;

  /**
   * 审核相关元数据。
   * - reviewedBy: 操作的 admin 用户 id
   * - reviewedAt: 上次状态变更时间
   * - rejectionReason: 退回 / 隐藏的原因（运营内部留痕，不对外）
   */
  @Column({ type: 'uuid', name: 'reviewed_by', nullable: true })
  reviewedBy: string | null;

  @Column({ type: 'timestamptz', name: 'reviewed_at', nullable: true })
  reviewedAt: Date | null;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'rejection_reason',
    nullable: true,
  })
  rejectionReason: string | null;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @Column({ type: 'int', default: 0 })
  comments: number;

  @Column({ type: 'int', default: 0 })
  saves: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
