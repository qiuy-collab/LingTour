import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdminCmsFields1737110000000 implements MigrationInterface {
  name = 'AdminCmsFields1737110000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';
    `);

    await queryRunner.query(`
      ALTER TABLE store_products
      ADD COLUMN IF NOT EXISTS origin_trace JSONB;
    `);

    await queryRunner.query(`
      ALTER TABLE interpreter_profiles
      ADD COLUMN IF NOT EXISTS avatar VARCHAR(500) NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS bio JSONB,
      ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'pending_review',
      ADD COLUMN IF NOT EXISTS city VARCHAR(120) NOT NULL DEFAULT '';
    `);

    await queryRunner.query(`
      ALTER TABLE interpreting_faqs
      ADD COLUMN IF NOT EXISTS category VARCHAR(40) NOT NULL DEFAULT 'interpreting';
    `);

    await queryRunner.query(`
      ALTER TABLE booking_submissions
      ADD COLUMN IF NOT EXISTS assigned_interpreter_id UUID,
      ADD COLUMN IF NOT EXISTS assigned_interpreter_name VARCHAR(200);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE booking_submissions
      DROP COLUMN IF EXISTS assigned_interpreter_name,
      DROP COLUMN IF EXISTS assigned_interpreter_id;
    `);
    await queryRunner.query(`
      ALTER TABLE interpreting_faqs
      DROP COLUMN IF EXISTS category;
    `);
    await queryRunner.query(`
      ALTER TABLE interpreter_profiles
      DROP COLUMN IF EXISTS city,
      DROP COLUMN IF EXISTS status,
      DROP COLUMN IF EXISTS bio,
      DROP COLUMN IF EXISTS avatar;
    `);
    await queryRunner.query(`
      ALTER TABLE store_products
      DROP COLUMN IF EXISTS origin_trace;
    `);
    await queryRunner.query(`
      ALTER TABLE users
      DROP COLUMN IF EXISTS status;
    `);
  }
}
