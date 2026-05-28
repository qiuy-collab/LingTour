import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImagesArrayToStops1751200000000 implements MigrationInterface {
  name = 'AddImagesArrayToStops1751200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE route_stops
      ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE route_stops DROP COLUMN IF EXISTS images;
    `);
  }
}
