import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Outbound email delivery log.
 *
 * One row per `MailerService.sendTemplated` attempt, holding the rendered
 * subject/body that was actually handed to SMTP plus the variables behind it,
 * so the admin「发送日志」page can show what a traveller received and re-send a
 * failed message from the stored payload. Nothing here changes existing
 * tables; email_templates / email_smtp_settings are untouched.
 */
export class AddEmailLogs1762800000000 implements MigrationInterface {
  name = 'AddEmailLogs1762800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        event_key varchar(64) NOT NULL,
        recipient varchar(320) NOT NULL,
        subject varchar(255) NOT NULL,
        body_html text NOT NULL,
        body_text text NOT NULL,
        vars jsonb NULL,
        status varchar(20) NOT NULL DEFAULT 'sent',
        error text NULL,
        attempts integer NOT NULL DEFAULT 1,
        resource_type varchar(40) NULL,
        resource_id uuid NULL,
        last_attempt_at timestamptz NOT NULL DEFAULT now(),
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT PK_email_logs PRIMARY KEY (id)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_email_logs_event_key
        ON email_logs (event_key);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_email_logs_recipient
        ON email_logs (recipient);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_email_logs_status
        ON email_logs (status);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_email_logs_created_at
        ON email_logs (created_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_email_logs_created_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_email_logs_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_email_logs_recipient;`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_email_logs_event_key;`);
    await queryRunner.query(`DROP TABLE IF EXISTS email_logs;`);
  }
}