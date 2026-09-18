import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Admin-customized notification email template, unique per (event, locale).
 * When no row exists for a pair the built-in default from email-events.ts
 * is used, so templates are always overridable one at a time.
 */
@Entity('email_templates')
@Index(['eventKey', 'locale'], { unique: true })
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 64, name: 'event_key' })
  eventKey: string;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  locale: string;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'text', name: 'body_html' })
  bodyHtml: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
