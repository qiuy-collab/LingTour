import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('interpreter_profiles')
export class InterpreterProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'int', name: 'sort_order', unique: true })
  sortOrder: number;

  @Column({ type: 'jsonb' })
  name: string;

  @Column({ type: 'jsonb' })
  language: string;

  @Column({ type: 'jsonb' })
  focus: string;

  @Column({ type: 'jsonb', default: [] })
  helps: string[];

  @Column({ type: 'varchar', length: 500, default: '' })
  avatar: string;

  @Column({ type: 'jsonb', nullable: true })
  bio: string | null;

  @Column({ type: 'varchar', length: 30, default: 'pending_review' })
  status: string;

  @Column({ type: 'varchar', length: 120, default: '' })
  city: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
