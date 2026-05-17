import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHomeSettingsCommunity1737100000000 implements MigrationInterface {
  name = 'AddHomeSettingsCommunity1737100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE home_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        hero JSONB NOT NULL DEFAULT '{}'::jsonb,
        trust_metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
        entry_cards JSONB NOT NULL DEFAULT '[]'::jsonb,
        culture_highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
        testimonials JSONB NOT NULL DEFAULT '[]'::jsonb,
        featured_route_slugs JSONB NOT NULL DEFAULT '[]'::jsonb,
        featured_product_slugs JSONB NOT NULL DEFAULT '[]'::jsonb,
        featured_city_slugs JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE app_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        scope VARCHAR(40) NOT NULL UNIQUE DEFAULT 'default',
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX idx_app_settings_scope ON app_settings(scope);
    `);

    await queryRunner.query(`
      CREATE TABLE community_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        channel VARCHAR(120) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'published',
        "user" JSONB NOT NULL,
        title JSONB NOT NULL,
        excerpt JSONB NOT NULL,
        tags JSONB NOT NULL DEFAULT '[]'::jsonb,
        image VARCHAR(500),
        location VARCHAR(200) NOT NULL DEFAULT '',
        route VARCHAR(200) NOT NULL DEFAULT '',
        mood VARCHAR(120) NOT NULL DEFAULT '',
        likes INT NOT NULL DEFAULT 0,
        comments INT NOT NULL DEFAULT 0,
        saves INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_community_posts_status ON community_posts(status);
      CREATE INDEX idx_community_posts_channel ON community_posts(channel);
      CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS community_posts CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS app_settings CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS home_configs CASCADE`);
  }
}
