import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuditLogs1751100000000 implements MigrationInterface {
  name = 'AddAuditLogs1751100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        user_name VARCHAR(200) NOT NULL DEFAULT '',
        action VARCHAR(40) NOT NULL,
        resource VARCHAR(60) NOT NULL,
        resource_id VARCHAR(200),
        resource_name VARCHAR(500),
        details JSONB,
        ip VARCHAR(100),
        user_agent TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
      ON audit_logs(created_at DESC);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action
      ON audit_logs(action);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_resource
      ON audit_logs(resource);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
      ON audit_logs(user_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_audit_logs_user_id;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_audit_logs_resource;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_audit_logs_action;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_audit_logs_created_at;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS audit_logs;`);
  }
}
