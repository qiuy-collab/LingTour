import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeparateTravelerRole1761100000000 implements MigrationInterface {
  name = 'SeparateTravelerRole1761100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users ALTER COLUMN role SET DEFAULT 'traveler';

      UPDATE users
         SET role = 'traveler', updated_at = now()
       WHERE role = 'editor'
         AND email <> 'editor@lingtour.cn'
         AND (
           COALESCE(provider, '') <> ''
           OR COALESCE(member_since, '') <> ''
         );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE users SET role = 'editor', updated_at = now() WHERE role = 'traveler';
      ALTER TABLE users ALTER COLUMN role SET DEFAULT 'editor';
    `);
  }
}
