import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Single-row SMTP configuration edited from the admin「邮箱设置」page.
 * Falls back to the SMTP_* environment variables field-by-field whenever a
 * column is NULL, so an empty database row never breaks the deployed env
 * setup and a saved row overrides env without a redeploy.
 */
@Entity('email_smtp_settings')
export class EmailSmtpSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 40, unique: true, default: 'default' })
  scope: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  host: string | null;

  @Column({ type: 'int', default: 587 })
  port: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  username: string | null;

  /**
   * Write-only by contract: never returned to the client. An empty value on
   * save keeps the existing password (database value, then env fallback).
   */
  @Column({ type: 'text', nullable: true })
  password: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'from_email' })
  fromEmail: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'from_name' })
  fromName: string | null;

  @Column({ type: 'boolean', default: true, name: 'use_tls' })
  useTls: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
