import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Community posts gain a multi-image / live-photo media array.
 *
 * The legacy single `image` varchar stays untouched and remains the fallback
 * for posts authored before this column existed; `media` starts empty for
 * those rows. Live photos store the video path (mp4/webm/mov/m4v) as the
 * item url, rendered through a muted video element whose first frame acts as
 * the static view.
 */
export class AddCommunityPostMedia1762600000000
  implements MigrationInterface
{
  name = 'AddCommunityPostMedia1762600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE community_posts
        ADD COLUMN IF NOT EXISTS media jsonb NOT NULL DEFAULT '[]';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE community_posts
        DROP COLUMN IF EXISTS media;
    `);
  }
}
