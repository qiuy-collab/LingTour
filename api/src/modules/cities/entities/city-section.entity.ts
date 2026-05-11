import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { City } from './city.entity';

@Entity('city_culture_sections')
export class CityCultureSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', name: 'city_id' })
  cityId: string;

  @ManyToOne(() => City, (city) => city.sections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column({ type: 'jsonb' })
  title: { en: string; zh: string };

  @Column({ type: 'jsonb' })
  body: { en: string; zh: string };

  @Column({ type: 'varchar', length: 500 })
  image: string;

  @Column({ type: 'jsonb', name: 'stat_label', nullable: true })
  statLabel: { en: string; zh: string } | null;

  @Column({ type: 'jsonb', name: 'stat_value', nullable: true })
  statValue: { en: string; zh: string } | null;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'breath_image',
    nullable: true,
  })
  breathImage: string | null;

  @Column({ type: 'jsonb', name: 'breath_quote', nullable: true })
  breathQuote: { en: string; zh: string } | null;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
