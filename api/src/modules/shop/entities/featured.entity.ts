import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('frontend_featured')
@Index(['section', 'refType', 'refId'], { unique: true })
@Index(['section'])
export class FrontendFeatured {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 60 })
  section: string;

  @Column({ type: 'varchar', length: 40, name: 'ref_type' })
  refType: string;

  @Column({ type: 'uuid', name: 'ref_id' })
  refId: string;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
