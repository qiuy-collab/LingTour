import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StoreCollection } from './store-collection.entity';
import type { MediaAsset } from '../../../common/types/media';

@Entity('store_products')
export class StoreProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 120, unique: true })
  slug: string;

  @Column({ type: 'jsonb' })
  name: string;

  @Index()
  @Column({ type: 'uuid', name: 'collection_id', nullable: true })
  collectionId: string | null;

  @ManyToOne(() => StoreCollection, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'collection_id' })
  collection: StoreCollection | null;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 10, default: 'SGD' })
  currency: string;

  @Column({ type: 'jsonb' })
  tag: string;

  @Column({ type: 'varchar', length: 500 })
  image: string;

  @Column({ type: 'jsonb', name: 'primary_media', nullable: true })
  primaryMedia: MediaAsset | null;

  @Column({ type: 'jsonb' })
  story: string;

  @Column({ type: 'jsonb', nullable: true })
  material: string | null;

  @Column({ type: 'jsonb', nullable: true })
  dimensions: string | null;

  @Column({ type: 'jsonb', nullable: true })
  origin: string | null;

  @Column({ type: 'jsonb', nullable: true })
  care: string | null;

  @Column({ type: 'jsonb', name: 'origin_trace', nullable: true })
  originTrace: Record<string, unknown> | null;

  @Column({ type: 'jsonb', default: [] })
  gallery: string[];

  @Column({ type: 'jsonb', name: 'gallery_media', default: [] })
  galleryMedia: MediaAsset[];

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Index()
  @Column({ type: 'boolean', default: false })
  published: boolean;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at' })
  deletedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
