import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImagesArrayToCitySections1751200000001 implements MigrationInterface {
  name = 'AddImagesArrayToCitySections1751200000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE city_culture_sections
      ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE city_culture_sections DROP COLUMN IF EXISTS images;
    `);
  }
}
