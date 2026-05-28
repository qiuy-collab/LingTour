import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMediaLibrary1751400000000 implements MigrationInterface {
  name = 'AddMediaLibrary1751400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS media_files (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        filename VARCHAR(255) NOT NULL UNIQUE,
        original_name VARCHAR(500),
        mime_type VARCHAR(100),
        size_bytes BIGINT,
        module VARCHAR(50),
        uploaded_by VARCHAR(255),
        entity_type VARCHAR(50),
        entity_id VARCHAR(255),
        url VARCHAR(500) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_media_files_module
      ON media_files(module);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_media_files_entity
      ON media_files(entity_type, entity_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_media_files_created
      ON media_files(created_at DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_media_files_created;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_media_files_entity;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_media_files_module;`);
    await queryRunner.query(`DROP TABLE IF EXISTS media_files;`);
  }
}
