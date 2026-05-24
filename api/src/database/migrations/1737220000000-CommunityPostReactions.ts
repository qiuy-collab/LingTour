import { MigrationInterface, QueryRunner } from 'typeorm';

export class CommunityPostReactions1737220000000
  implements MigrationInterface
{
  name = 'CommunityPostReactions1737220000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS community_post_likes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        post_id UUID NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT fk_community_post_likes_user
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_community_post_likes_post
          FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
        CONSTRAINT uq_community_post_likes_user_post UNIQUE (user_id, post_id)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS community_post_saves (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        post_id UUID NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT fk_community_post_saves_user
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_community_post_saves_post
          FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
        CONSTRAINT uq_community_post_saves_user_post UNIQUE (user_id, post_id)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_community_post_likes_user_id
      ON community_post_likes(user_id);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_community_post_likes_post_id
      ON community_post_likes(post_id);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_community_post_saves_user_id
      ON community_post_saves(user_id);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_community_post_saves_post_id
      ON community_post_saves(post_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_community_post_saves_post_id;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_community_post_saves_user_id;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_community_post_likes_post_id;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_community_post_likes_user_id;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS community_post_saves;`);
    await queryRunner.query(`DROP TABLE IF EXISTS community_post_likes;`);
  }
}
