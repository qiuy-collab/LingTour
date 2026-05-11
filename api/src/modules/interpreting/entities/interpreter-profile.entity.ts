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
  name: { en: string; zh: string };

  @Column({ type: 'jsonb' })
  language: { en: string; zh: string };

  @Column({ type: 'jsonb' })
  focus: { en: string; zh: string };

  @Column({ type: 'jsonb', default: [] })
  helps: { en: string; zh: string }[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
