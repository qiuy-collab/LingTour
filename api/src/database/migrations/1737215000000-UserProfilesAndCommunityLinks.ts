import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserProfilesAndCommunityLinks1737215000000
  implements MigrationInterface
{
  name = 'UserProfilesAndCommunityLinks1737215000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS country VARCHAR(80) NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS home_base VARCHAR(80) NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS travel_style VARCHAR(80) NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS provider VARCHAR(40) NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS member_since VARCHAR(30) NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS bio VARCHAR(600) NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS profile_visibility VARCHAR(20) NOT NULL DEFAULT 'public';
    `);

    await queryRunner.query(`
      ALTER TABLE community_posts
      ADD COLUMN IF NOT EXISTS user_id UUID,
      ADD COLUMN IF NOT EXISTS user_email VARCHAR(255) NOT NULL DEFAULT '';
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_community_posts_user_email ON community_posts(user_email);
    `);

    await queryRunner.query(`
      UPDATE users
      SET member_since = TO_CHAR(created_at, 'YYYY-MM-DD')
      WHERE COALESCE(member_since, '') = '';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_community_posts_user_email;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_community_posts_user_id;`,
    );
    await queryRunner.query(`
      ALTER TABLE community_posts
      DROP COLUMN IF EXISTS user_email,
      DROP COLUMN IF EXISTS user_id;
    `);

    await queryRunner.query(`
      ALTER TABLE users
      DROP COLUMN IF EXISTS profile_visibility,
      DROP COLUMN IF EXISTS bio,
      DROP COLUMN IF EXISTS member_since,
      DROP COLUMN IF EXISTS provider,
      DROP COLUMN IF EXISTS travel_style,
      DROP COLUMN IF EXISTS home_base,
      DROP COLUMN IF EXISTS country,
      DROP COLUMN IF EXISTS avatar_url;
    `);
  }
}
