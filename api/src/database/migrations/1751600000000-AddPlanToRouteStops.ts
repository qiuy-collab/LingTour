import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlanToRouteStops1751600000000 implements MigrationInterface {
  name = 'AddPlanToRouteStops1751600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE route_stops
      ADD COLUMN IF NOT EXISTS plan TEXT;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE route_stops
      DROP COLUMN IF EXISTS plan;
    `);
  }
}
