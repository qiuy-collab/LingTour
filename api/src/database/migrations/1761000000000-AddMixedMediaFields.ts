import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMixedMediaFields1761000000000 implements MigrationInterface {
  name = 'AddMixedMediaFields1761000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE store_products
        ADD COLUMN IF NOT EXISTS primary_media JSONB,
        ADD COLUMN IF NOT EXISTS gallery_media JSONB NOT NULL DEFAULT '[]'::jsonb;

      ALTER TABLE cities
        ADD COLUMN IF NOT EXISTS hero_media JSONB,
        ADD COLUMN IF NOT EXISTS gallery_media JSONB NOT NULL DEFAULT '[]'::jsonb;

      ALTER TABLE city_culture_sections
        ADD COLUMN IF NOT EXISTS primary_media JSONB,
        ADD COLUMN IF NOT EXISTS media JSONB NOT NULL DEFAULT '[]'::jsonb;

      ALTER TABLE route_stops
        ADD COLUMN IF NOT EXISTS primary_media JSONB,
        ADD COLUMN IF NOT EXISTS media JSONB NOT NULL DEFAULT '[]'::jsonb;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE route_stops
        DROP COLUMN IF EXISTS media,
        DROP COLUMN IF EXISTS primary_media;

      ALTER TABLE city_culture_sections
        DROP COLUMN IF EXISTS media,
        DROP COLUMN IF EXISTS primary_media;

      ALTER TABLE cities
        DROP COLUMN IF EXISTS gallery_media,
        DROP COLUMN IF EXISTS hero_media;

      ALTER TABLE store_products
        DROP COLUMN IF EXISTS gallery_media,
        DROP COLUMN IF EXISTS primary_media;
    `);
  }
}
