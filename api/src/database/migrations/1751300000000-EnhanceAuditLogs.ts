import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceAuditLogs1751300000000 implements MigrationInterface {
  name = 'EnhanceAuditLogs1751300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add old_values JSONB column — stores the entity state before the change
    await queryRunner.query(`
      ALTER TABLE audit_logs
      ADD COLUMN IF NOT EXISTS old_values JSONB;
    `);

    // Add new_values JSONB column — stores the entity state after the change
    await queryRunner.query(`
      ALTER TABLE audit_logs
      ADD COLUMN IF NOT EXISTS new_values JSONB;
    `);

    // GIN indexes on the JSONB columns for efficient querying
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_old_values
      ON audit_logs USING GIN (old_values);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_new_values
      ON audit_logs USING GIN (new_values);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_audit_logs_new_values;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_audit_logs_old_values;`,
    );
    await queryRunner.query(
      `ALTER TABLE audit_logs DROP COLUMN IF EXISTS new_values;`,
    );
    await queryRunner.query(
      `ALTER TABLE audit_logs DROP COLUMN IF EXISTS old_values;`,
    );
  }
}
