import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeaturedRouteStops1761900000000 implements MigrationInterface {
  name = 'AddFeaturedRouteStops1761900000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE route_stops ADD COLUMN is_featured boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`UPDATE route_stops SET is_featured = true WHERE id IN (
      SELECT DISTINCT ON (route_id) id FROM route_stops ORDER BY route_id, sort_order, id
    )`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE route_stops DROP COLUMN is_featured');
  }
}
