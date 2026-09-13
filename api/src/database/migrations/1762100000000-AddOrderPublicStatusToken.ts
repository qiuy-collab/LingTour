import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderPublicStatusToken1762100000000 implements MigrationInterface {
  name = 'AddOrderPublicStatusToken1762100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS public_status_token_hash VARCHAR(64)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders
      DROP COLUMN IF EXISTS public_status_token_hash
    `);
  }
}
