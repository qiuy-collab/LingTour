import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStockReservationsAndBookingIdempotency1762200000000
  implements MigrationInterface
{
  name = 'AddStockReservationsAndBookingIdempotency1762200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS stock_reserved BOOLEAN NOT NULL DEFAULT FALSE
    `);
    await queryRunner.query(`
      ALTER TABLE booking_submissions
      ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(100)
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_submissions_idempotency_key
      ON booking_submissions (idempotency_key)
      WHERE idempotency_key IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS idx_booking_submissions_idempotency_key',
    );
    await queryRunner.query(
      'ALTER TABLE booking_submissions DROP COLUMN IF EXISTS idempotency_key',
    );
    await queryRunner.query(
      'ALTER TABLE orders DROP COLUMN IF EXISTS stock_reserved',
    );
  }
}
