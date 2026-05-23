import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 50, default: 'editor' })
  role: 'admin' | 'editor';

  @Index()
  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: 'active' | 'banned';

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 500, name: 'avatar_url', default: '' })
  avatarUrl: string;

  @Column({ type: 'varchar', length: 80, default: '' })
  country: string;

  @Column({ type: 'varchar', length: 80, name: 'home_base', default: '' })
  homeBase: string;

  @Column({ type: 'varchar', length: 80, name: 'travel_style', default: '' })
  travelStyle: string;

  @Column({ type: 'varchar', length: 40, default: '' })
  provider: string;

  @Column({ type: 'varchar', length: 30, name: 'member_since', default: '' })
  memberSince: string;

  @Column({ type: 'varchar', length: 600, default: '' })
  bio: string;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'profile_visibility',
    default: 'public',
  })
  profileVisibility: 'public' | 'community' | 'private';

  @Index()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
