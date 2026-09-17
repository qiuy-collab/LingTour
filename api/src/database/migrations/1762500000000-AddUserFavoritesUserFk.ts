import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * user_favorites.user_id was a bare uuid column with no foreign key, so
 * deleting a user left orphaned favorites behind (report P3-13). This
 * migration removes existing orphans and adds the FK with CASCADE so the
 * vault is always user-owned.
 */
export class AddUserFavoritesUserFk1762500000000
  implements MigrationInterface
{
  name = 'AddUserFavoritesUserFk1762500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM user_favorites f
      WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = f.user_id);
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_favorites_user'
        ) THEN
          ALTER TABLE user_favorites
            ADD CONSTRAINT fk_user_favorites_user
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE user_favorites DROP CONSTRAINT IF EXISTS fk_user_favorites_user;
    `);
  }
}
