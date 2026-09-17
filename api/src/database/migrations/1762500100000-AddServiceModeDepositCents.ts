import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Report P2-8: deposit pricing used to be derived from free-text keywords in
 * the booking's supportMode field, fully detached from the CMS. This adds an
 * optional numeric deposit (minor units) per service mode so the booking flow
 * can price deposits from an explicit serviceModeId. NULL keeps the legacy
 * keyword fallback active for modes that have not been configured yet.
 */
export class AddServiceModeDepositCents1762500100000
  implements MigrationInterface
{
  name = 'AddServiceModeDepositCents1762500100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE interpreting_service_modes
        ADD COLUMN IF NOT EXISTS deposit_cents integer NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE interpreting_service_modes
        DROP COLUMN IF EXISTS deposit_cents;
    `);
  }
}
