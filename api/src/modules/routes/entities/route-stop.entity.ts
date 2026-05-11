import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { StoryRoute } from './story-route.entity';

@Entity('route_stops')
@Index(['routeId', 'sortOrder'], { unique: true })
export class RouteStop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', name: 'route_id' })
  routeId: string;

  @ManyToOne(() => StoryRoute, (route) => route.stops, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route: StoryRoute;

  @Column({ type: 'int', name: 'sort_order' })
  sortOrder: number;

  @Column({ type: 'varchar', length: 20 })
  time: string;

  @Column({ type: 'jsonb', name: 'stop_name' })
  stopName: { en: string; zh: string };

  @Column({ type: 'jsonb' })
  story: { en: string; zh: string };

  @Column({ type: 'jsonb', name: 'cultural_story' })
  culturalStory: { en: string; zh: string };

  @Column({ type: 'jsonb', default: [] })
  details: { en: string; zh: string }[];

  @Column({ type: 'varchar', length: 500 })
  image: string;

  @Column({ type: 'double precision', nullable: true })
  lat: number | null;

  @Column({ type: 'double precision', nullable: true })
  lng: number | null;

  @Column({ type: 'jsonb', nullable: true })
  meal: { en: string; zh: string } | null;

  @Column({ type: 'jsonb', nullable: true })
  hotel: { en: string; zh: string } | null;

  @Column({ type: 'jsonb', nullable: true })
  transit: { en: string; zh: string } | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
