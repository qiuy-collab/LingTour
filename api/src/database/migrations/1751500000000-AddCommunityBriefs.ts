import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommunityBriefs1751500000000 implements MigrationInterface {
  name = 'AddCommunityBriefs1751500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS community_briefs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(80) NOT NULL UNIQUE,
        title JSONB NOT NULL,
        prompt JSONB NOT NULL,
        channel VARCHAR(80) NOT NULL DEFAULT 'Field Notes',
        location VARCHAR(200) NOT NULL DEFAULT '',
        route VARCHAR(200) NOT NULL DEFAULT '',
        mood VARCHAR(120) NOT NULL DEFAULT '',
        sort_order INT NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_community_briefs_slug
      ON community_briefs(slug);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_community_briefs_active
      ON community_briefs(active);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_community_briefs_sort_order
      ON community_briefs(sort_order);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_community_briefs_sort_order;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_community_briefs_active;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_community_briefs_slug;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS community_briefs;`);
  }
}
