import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserFavorites1762000000000 implements MigrationInterface {
  name = 'AddUserFavorites1762000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        target_type varchar(30) NOT NULL,
        target_id varchar(200) NOT NULL,
        target_title varchar(300) NOT NULL DEFAULT '',
        target_image varchar(500) NOT NULL DEFAULT '',
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_user_favorites_target UNIQUE (user_id, target_type, target_id)
      );
      CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS user_favorites');
  }
}
