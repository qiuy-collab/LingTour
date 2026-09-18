import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Admin email-settings module:
 * - email_smtp_settings: single-row SMTP configuration edited from the
 *   admin「邮箱设置」page; NULL columns fall back to the SMTP_* environment
 *   variables so an empty row never breaks the deployed env setup.
 * - email_templates: admin-customized notification email body/subject per
 *   (event_key, locale); missing rows fall back to the built-in defaults.
 */
export class AddEmailSettingsAndTemplates1762700000000
  implements MigrationInterface
{
  name = 'AddEmailSettingsAndTemplates1762700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS email_smtp_settings (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        scope varchar(40) NOT NULL DEFAULT 'default',
        host varchar(255) NULL,
        port integer NOT NULL DEFAULT 587,
        username varchar(255) NULL,
        password text NULL,
        from_email varchar(255) NULL,
        from_name varchar(255) NULL,
        use_tls boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT PK_email_smtp_settings PRIMARY KEY (id),
        CONSTRAINT UQ_email_smtp_settings_scope UNIQUE (scope)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS email_templates (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        event_key varchar(64) NOT NULL,
        locale varchar(10) NOT NULL DEFAULT 'en',
        subject varchar(255) NOT NULL,
        body_html text NOT NULL,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT PK_email_templates PRIMARY KEY (id)
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS UQ_email_templates_event_locale
        ON email_templates (event_key, locale);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_email_templates_event_key
        ON email_templates (event_key);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_email_templates_event_key;`);
    await queryRunner.query(`DROP INDEX IF EXISTS UQ_email_templates_event_locale;`);
    await queryRunner.query(`DROP TABLE IF EXISTS email_templates;`);
    await queryRunner.query(`DROP TABLE IF EXISTS email_smtp_settings;`);
  }
}
