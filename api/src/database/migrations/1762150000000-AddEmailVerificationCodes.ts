import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailVerificationCodes1762150000000 implements MigrationInterface {
  name = 'AddEmailVerificationCodes1762150000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS auth_verification_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL,
        purpose VARCHAR(20) NOT NULL,
        code_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        consumed_at TIMESTAMPTZ,
        attempts INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_auth_verification_codes_email_purpose_consumed
      ON auth_verification_codes (email, purpose, consumed_at)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_auth_verification_codes_expires_at
      ON auth_verification_codes (expires_at)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_auth_verification_codes_expires_at');
    await queryRunner.query('DROP INDEX IF EXISTS idx_auth_verification_codes_email_purpose_consumed');
    await queryRunner.query('DROP TABLE IF EXISTS auth_verification_codes');
  }
}
