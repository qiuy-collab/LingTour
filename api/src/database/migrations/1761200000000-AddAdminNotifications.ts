import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminNotifications1761200000000 implements MigrationInterface {
  name = 'AddAdminNotifications1761200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS admin_notifications (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        recipient_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type varchar(20) NOT NULL,
        title varchar(180) NOT NULL,
        body varchar(600) NOT NULL DEFAULT '',
        read boolean NOT NULL DEFAULT false,
        resource_type varchar(40) NOT NULL DEFAULT '',
        resource_id varchar(100) NOT NULL DEFAULT '',
        link varchar(300) NOT NULL DEFAULT '',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_admin_notifications_type
          CHECK (type IN ('order', 'booking', 'review', 'system', 'audit'))
      );
      CREATE INDEX IF NOT EXISTS idx_admin_notifications_recipient ON admin_notifications(recipient_id);
      CREATE INDEX IF NOT EXISTS idx_admin_notifications_created ON admin_notifications(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_admin_notifications_unread ON admin_notifications(recipient_id, read, created_at DESC);
      INSERT INTO admin_notifications (recipient_id, type, title, body, resource_type, link)
      SELECT id, 'system', '通知中心已启用',
             '新订单、口译预约和待审核社区内容会在这里提醒。',
             'system', '/admin/system/notifications'
        FROM users
       WHERE role IN ('admin', 'editor') AND status = 'active';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS admin_notifications');
  }
}
