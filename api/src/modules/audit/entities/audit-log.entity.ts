import {
  AfterLoad,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string;

  @Column({ type: 'varchar', length: 200, name: 'user_name', default: '' })
  userName: string;

  @Index()
  @Column({ type: 'varchar', length: 40 })
  action: string;

  @Index()
  @Column({ type: 'varchar', length: 60 })
  resource: string;

  @Column({ type: 'varchar', length: 200, name: 'resource_id', nullable: true })
  resourceId: string;

  @Column({ type: 'varchar', length: 500, name: 'resource_name', nullable: true })
  resourceName: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>;

  @Column({ type: 'jsonb', name: 'old_values', nullable: true })
  oldValues: Record<string, any>;

  @Column({ type: 'jsonb', name: 'new_values', nullable: true })
  newValues: Record<string, any>;

  /**
   * Computed field (not stored in DB) that shows only the fields that
   * actually changed between oldValues and newValues.
   */
  changes?: Record<string, { old: any; new: any }>;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ip: string;

  @Column({ type: 'text', name: 'user_agent', nullable: true })
  userAgent: string;

  @Index()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  /**
   * After loading from the DB, compute the `changes` diff by comparing
   * oldValues and newValues — only fields whose values actually differ
   * are included.
   */
  @AfterLoad()
  computeChanges(): void {
    if (!this.oldValues && !this.newValues) {
      this.changes = undefined;
      return;
    }

    const old = this.oldValues ?? {};
    const neo = this.newValues ?? {};
    const allKeys = new Set([...Object.keys(old), ...Object.keys(neo)]);
    const diff: Record<string, { old: any; new: any }> = {};

    for (const key of allKeys) {
      const oldVal = old[key];
      const newVal = neo[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        diff[key] = { old: oldVal, new: newVal };
      }
    }

    this.changes = Object.keys(diff).length > 0 ? diff : undefined;
  }
}
