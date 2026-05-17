import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('community_posts')
export class CommunityPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  @Index()
  channel: string;

  @Column({ type: 'varchar', length: 30, default: 'published' })
  @Index()
  status: string;

  @Column({ type: 'jsonb' })
  user: Record<string, unknown>;

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
}

