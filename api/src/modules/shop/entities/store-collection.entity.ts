import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('store_collections')
export class StoreCollection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'jsonb' })
  title: { en: string; zh: string };

  @Column({ type: 'varchar', length: 200, name: 'route_name' })
  routeName: string;

  @Column({ type: 'varchar', length: 100, name: 'route_slug', default: '' })
  routeSlug: string;

  @Column({ type: 'varchar', length: 500 })
  image: string;

  @Column({ type: 'jsonb' })
  body: { en: string; zh: string };

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
