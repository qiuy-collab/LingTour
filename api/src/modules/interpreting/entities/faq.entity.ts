import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('interpreting_faqs')
export class Faq {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'int', name: 'sort_order', unique: true })
  sortOrder: number;

  @Column({ type: 'jsonb' })
  question: { en: string; zh: string };

  @Column({ type: 'jsonb' })
  answer: { en: string; zh: string };

  @Column({ type: 'varchar', length: 40, default: 'interpreting' })
  category: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
