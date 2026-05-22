import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEvents1737105000000 implements MigrationInterface {
  name = 'AddEvents1737105000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(120) NOT NULL UNIQUE,
        title JSONB NOT NULL,
        summary JSONB NOT NULL DEFAULT '{"en":"","zh":""}'::jsonb,
        description JSONB NOT NULL DEFAULT '{"en":"","zh":""}'::jsonb,
        city VARCHAR(120) NOT NULL DEFAULT '',
        city_slug VARCHAR(120) NOT NULL DEFAULT '',
        date DATE NOT NULL,
        end_date DATE,
        tags JSONB NOT NULL DEFAULT '[]'::jsonb,
        image VARCHAR(500),
        status VARCHAR(30) NOT NULL DEFAULT 'draft',
        related_route_slugs JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_events_status ON events(status);
      CREATE INDEX idx_events_date ON events(date DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS events CASCADE`);
  }
}
