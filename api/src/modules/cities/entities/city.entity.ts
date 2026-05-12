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
import { CityCultureSection } from './city-section.entity';

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'jsonb' })
  name: { en: string; zh: string };

  @Column({ type: 'jsonb', name: 'region_label' })
  regionLabel: { en: string; zh: string };

  @Column({ type: 'varchar', length: 500, name: 'hero_image' })
  heroImage: string;

  @Column({ type: 'jsonb', name: 'hero_narrative' })
  heroNarrative: { en: string; zh: string };

  @Column({ type: 'jsonb', default: [] })
  tags: { en: string; zh: string }[];

  @Column({ type: 'jsonb', name: 'editor_intro' })
  editorIntro: { en: string; zh: string };

  @Column({ type: 'jsonb', name: 'gallery_images', default: [] })
  galleryImages: string[];

  @Column({ type: 'jsonb', name: 'food_title' })
  foodTitle: { en: string; zh: string };

  @Column({ type: 'jsonb', name: 'food_description' })
  foodDescription: { en: string; zh: string };

  @Column({ type: 'jsonb', name: 'food_images', default: [] })
  foodImages: string[];

  @Column({ type: 'int', nullable: true })
  adcode?: number;

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at' })
  deletedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => CityCultureSection, (section) => section.city, {
    cascade: true,
  })
  sections: CityCultureSection[];
}
