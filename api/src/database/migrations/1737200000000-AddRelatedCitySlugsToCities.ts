import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelatedCitySlugsToCities1737200000000 implements MigrationInterface {
  name = 'AddRelatedCitySlugsToCities1737200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE cities
      ADD COLUMN IF NOT EXISTS related_city_slugs JSONB NOT NULL DEFAULT '[]'::jsonb;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE cities
      DROP COLUMN IF EXISTS related_city_slugs;
    `);
  }
}
