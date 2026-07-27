import { MigrationInterface, QueryRunner } from 'typeorm';

export class SecureInterpretingDeposits1761600000000
  implements MigrationInterface
{
  name = 'SecureInterpretingDeposits1761600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS payment_status varchar(20) NOT NULL DEFAULT 'unpaid',
        ADD COLUMN IF NOT EXISTS paid_at timestamptz,
        ADD COLUMN IF NOT EXISTS payment_failure_reason varchar(500),
        ADD COLUMN IF NOT EXISTS tracking_no varchar(100),
        ADD COLUMN IF NOT EXISTS refund_reason varchar(500),
        ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
        ADD COLUMN IF NOT EXISTS booking_submission_id uuid,
        ADD COLUMN IF NOT EXISTS order_type varchar(30) NOT NULL DEFAULT 'shop',
        ADD COLUMN IF NOT EXISTS currency varchar(10) NOT NULL DEFAULT 'SGD',
        ADD COLUMN IF NOT EXISTS stripe_payment_intent_id varchar(100),
        ADD COLUMN IF NOT EXISTS items jsonb NOT NULL DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS subtotal numeric(10,2) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS handling_amount numeric(10,2) NOT NULL DEFAULT 0;

      UPDATE orders
         SET payment_status = 'paid',
             paid_at = COALESCE(paid_at, created_at),
             status = 'confirmed'
       WHERE status = 'paid';

      ALTER TABLE orders DROP CONSTRAINT IF EXISTS fk_orders_booking_submission;
      ALTER TABLE orders
        ADD CONSTRAINT fk_orders_booking_submission
        FOREIGN KEY (booking_submission_id)
        REFERENCES booking_submissions(id) ON DELETE SET NULL;

      ALTER TABLE orders DROP CONSTRAINT IF EXISTS uq_orders_booking_submission;
      ALTER TABLE orders
        ADD CONSTRAINT uq_orders_booking_submission UNIQUE (booking_submission_id);

      ALTER TABLE orders DROP CONSTRAINT IF EXISTS uq_orders_stripe_payment_intent;
      ALTER TABLE orders
        ADD CONSTRAINT uq_orders_stripe_payment_intent UNIQUE (stripe_payment_intent_id);

      ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_orders_order_type;
      ALTER TABLE orders
        ADD CONSTRAINT chk_orders_order_type
        CHECK (order_type IN ('shop', 'interpreting_deposit'));

      CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
      CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_orders_booking_submission_id
        ON orders(booking_submission_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_orders_booking_submission_id;
      ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_orders_order_type;
      ALTER TABLE orders DROP CONSTRAINT IF EXISTS uq_orders_stripe_payment_intent;
      ALTER TABLE orders DROP CONSTRAINT IF EXISTS uq_orders_booking_submission;
      ALTER TABLE orders DROP CONSTRAINT IF EXISTS fk_orders_booking_submission;
      ALTER TABLE orders DROP COLUMN IF EXISTS handling_amount;
      ALTER TABLE orders DROP COLUMN IF EXISTS subtotal;
      ALTER TABLE orders DROP COLUMN IF EXISTS items;
      ALTER TABLE orders DROP COLUMN IF EXISTS stripe_payment_intent_id;
      ALTER TABLE orders DROP COLUMN IF EXISTS currency;
      ALTER TABLE orders DROP COLUMN IF EXISTS order_type;
      ALTER TABLE orders DROP COLUMN IF EXISTS booking_submission_id;
    `);
  }
}
