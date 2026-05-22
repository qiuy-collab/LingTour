import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 「现场任务书」(Field Brief)：编辑团队抛给社区用户的拍摄/记录提示。
 *
 * 例：「在早餐之前，记录一件这座城市还没醒来时才会发生的事。」
 *
 * 用户在社区页看到这些任务书 → 点选某条 → 进入发帖框，
 * 发帖框会自动预填 location / route / mood，引导用户做出对应内容。
 *
 * 这张表非常瘦：编辑写文案 + 选个 channel/route 即可。
 */
@Entity('community_briefs')
export class CommunityBrief {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Stable slug for the URL, also used as a stable React key */
  @Column({ type: 'varchar', length: 80, unique: true })
  @Index({ unique: true })
  slug: string;

  @Column({ type: 'jsonb' })
  title: { en: string; zh: string };

  @Column({ type: 'jsonb' })
  prompt: { en: string; zh: string };

  /** 关联到哪个 channel（Field Notes / Food Map / Hidden Stop / Culture Desk） */
  @Column({ type: 'varchar', length: 80, default: 'Field Notes' })
  channel: string;

  /**
   * 默认预填到发帖框的元数据（用户仍可改）。
   * 不强类型，因为它就是给前端塞进发帖表单初值的。
   */
  @Column({ type: 'varchar', length: 200, default: '' })
  location: string;

  @Column({ type: 'varchar', length: 200, default: '' })
  route: string;

  @Column({ type: 'varchar', length: 120, default: '' })
  mood: string;

  /** 排序（小的在前），编辑可在 admin 调顺序 */
  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder: number;

  /** 是否对外可见。下线某条 brief 时 set false 即可。 */
  @Column({ type: 'boolean', default: true })
  @Index()
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
