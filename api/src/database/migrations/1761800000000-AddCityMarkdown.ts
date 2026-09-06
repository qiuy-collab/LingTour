import { MigrationInterface, QueryRunner } from 'typeorm';
import { legacyCityToMarkdown } from '../city-markdown';

export class AddCityMarkdown1761800000000 implements MigrationInterface {
  name = 'AddCityMarkdown1761800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE cities
        ADD COLUMN IF NOT EXISTS content_markdown TEXT NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
    `);

    // TypeORM runs this once in its migration transaction. Read deleted records
    // too, but never alter their legacy fields, status, or historical timestamps.
    const cities: Array<Record<string, unknown> & { id: string }> =
      await queryRunner.query(`
        SELECT c.*, COALESCE(
          (SELECT jsonb_agg(to_jsonb(s) ORDER BY s.sort_order, s.created_at, s.id)
           FROM city_culture_sections s WHERE s.city_id = c.id),
          '[]'::jsonb
        ) AS sections
        FROM cities c
        WHERE c.content_markdown = ''
        ORDER BY c.id
      `);
    for (const city of cities) {
      await queryRunner.query(
        `UPDATE cities SET content_markdown = $1
         WHERE id = $2 AND content_markdown = ''`,
        [legacyCityToMarkdown(city), city.id],
      );
    }
    // Existing published dates are unknown; do not invent them from created_at.
  }

  public async down(): Promise<void> {
    throw new Error(
      'City Markdown migration is forward-only: dropping the columns would destroy authored content and publication history.',
    );
  }
}
