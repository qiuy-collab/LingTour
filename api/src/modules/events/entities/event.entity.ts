import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('events')
export class EventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 120, unique: true })
  slug: string;

  @Column({ type: 'jsonb' })
  title: { en: string; zh: string };

  @Column({ type: 'jsonb', default: { en: '', zh: '' } })
  summary: { en: string; zh: string };

  @Column({ type: 'jsonb', default: { en: '', zh: '' } })
  description: { en: string; zh: string };

  @Column({ type: 'varchar', length: 120, default: '' })
  city: string;

  @Column({ type: 'varchar', length: 120, name: 'city_slug', default: '' })
  citySlug: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'date', name: 'end_date', nullable: true })
  endDate: string | null;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  image: string | null;

  @Index()
  @Column({ type: 'varchar', length: 30, default: 'draft' })
  status: string;

  @Column({ type: 'jsonb', name: 'related_route_slugs', default: [] })
  relatedRouteSlugs: string[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
