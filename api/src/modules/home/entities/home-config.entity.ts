import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('home_configs')
export class HomeConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb', default: {} })
  hero: Record<string, unknown>;

  @Column({ type: 'jsonb', name: 'trust_metrics', default: [] })
  trustMetrics: Array<Record<string, unknown>>;

  @Column({ type: 'jsonb', name: 'entry_cards', default: [] })
  entryCards: Array<Record<string, unknown>>;

  @Column({ type: 'jsonb', name: 'culture_highlights', default: [] })
  cultureHighlights: Array<Record<string, unknown>>;

  @Column({ type: 'jsonb', default: [] })
  testimonials: Array<Record<string, unknown>>;

  @Column({ type: 'jsonb', name: 'featured_route_slugs', default: [] })
  featuredRouteSlugs: string[];

  @Column({ type: 'jsonb', name: 'featured_product_slugs', default: [] })
  featuredProductSlugs: string[];

  @Column({ type: 'jsonb', name: 'featured_city_slugs', default: [] })
  featuredCitySlugs: string[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
