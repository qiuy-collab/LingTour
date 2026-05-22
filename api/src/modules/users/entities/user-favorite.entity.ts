import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * User favorites / "Personal Vault" items.
 * Stores references to routes, cities, or products that a user has saved.
 */
@Entity('user_favorites')
@Index(['userId', 'targetType', 'targetId'], { unique: true })
export class UserFavorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  @Index()
  userId: string;

  /** Type of the favorited item */
  @Column({ type: 'varchar', length: 30, name: 'target_type' })
  targetType: 'route' | 'city' | 'product';

  /** ID or slug of the favorited item */
  @Column({ type: 'varchar', length: 200, name: 'target_id' })
  targetId: string;

  /** Display title (denormalized for quick listing) */
  @Column({ type: 'varchar', length: 300, name: 'target_title', default: '' })
  targetTitle: string;

  /** Optional cover image URL */
  @Column({ type: 'varchar', length: 500, name: 'target_image', default: '' })
  targetImage: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
