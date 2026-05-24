import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { RouteStop } from './route-stop.entity';

@Entity('story_routes')
export class StoryRoute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'jsonb' })
  title: { en: string; zh: string };

  @Column({ type: 'varchar', length: 50, name: 'culture_tag' })
  cultureTag: string;

  @Column({ type: 'jsonb', name: 'city_name' })
  cityName: { en: string; zh: string };

  @Column({ type: 'jsonb' })
  duration: { en: string; zh: string };

  @Column({ type: 'jsonb' })
  audience: { en: string; zh: string };

  @Column({ type: 'jsonb' })
  summary: { en: string; zh: string };

  @Column({ type: 'jsonb' })
  story: { en: string; zh: string };

  @Column({ type: 'varchar', length: 500, name: 'cover_image' })
  coverImage: string;

  @Index()
  @Column({ type: 'boolean', default: false })
  published: boolean;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at' })
  deletedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => RouteStop, (stop) => stop.route, { cascade: true })
  stops: RouteStop[];
}
