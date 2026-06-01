import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCityAdcode1737224000000 implements MigrationInterface {
  name = 'AddCityAdcode1737224000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE cities
      ADD COLUMN IF NOT EXISTS adcode INT;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE cities
      DROP COLUMN IF EXISTS adcode;
    `);
  }
}
