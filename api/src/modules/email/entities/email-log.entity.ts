import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Delivery record for one outbound notification email.
 *
 * Every `sendTemplated` attempt writes one row: the event, the recipient, the
 * fully rendered subject/body that was handed to the SMTP transport, the
 * variables that produced it, and whether the relay accepted it. The admin
 * 「邮箱设置 → 发送日志」page reads this table, and a failed row can be
 * re-sent from the stored payload without re-deriving the variables.
 *
 * The rendered payload is stored rather than just the variable bag so a resend
 * is byte-identical to what failed, even if the template was edited meanwhile.
 */
@Entity('email_logs')
export class EmailLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 64, name: 'event_key' })
  eventKey: string;

  @Index()
  @Column({ type: 'varchar', length: 320 })
  recipient: string;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'text', name: 'body_html' })
  bodyHtml: string;

  @Column({ type: 'text', name: 'body_text' })
  bodyText: string;

  @Column({ type: 'jsonb', nullable: true })
  vars: Record<string, unknown> | null;

  @Index()
  @Column({ type: 'varchar', length: 20, default: 'sent' })
  status: 'sent' | 'failed' | 'skipped';

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @Column({ type: 'integer', default: 1 })
  attempts: number;

  /** Optional link to the business record that triggered the send. */
  @Column({ type: 'varchar', length: 40, name: 'resource_type', nullable: true })
  resourceType: string | null;

  @Column({ type: 'uuid', name: 'resource_id', nullable: true })
  resourceId: string | null;

  @Column({ type: 'timestamptz', name: 'last_attempt_at' })
  lastAttemptAt: Date;

  @Index()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}