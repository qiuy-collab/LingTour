import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('route_city_links')
@Index(['routeId', 'cityId'], { unique: true })
@Index(['routeId'])
@Index(['cityId'])
export class RouteCityLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'route_id' })
  routeId: string;

  @Column({ type: 'uuid', name: 'city_id' })
  cityId: string;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder: number;
}
