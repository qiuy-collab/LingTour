import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('interpreting_service_modes')
export class ServiceMode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'int', name: 'sort_order', unique: true })
  sortOrder: number;

  @Column({ type: 'jsonb' })
  title: string;

  @Column({ type: 'jsonb' })
  price: string;

  @Column({ type: 'jsonb', name: 'best_for' })
  bestFor: string;

  @Column({ type: 'jsonb' })
  body: string;

  @Column({ type: 'jsonb', default: [] })
  includes: string[];

  @Column({ type: 'varchar', length: 10, default: 'light' })
  accent: string;

  @Column({ type: 'boolean', default: false })
  featured: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
