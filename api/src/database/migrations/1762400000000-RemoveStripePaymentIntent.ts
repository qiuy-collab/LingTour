import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * PayPal is the only payment provider now. Removes the Stripe-only
 * stripe_payment_intent_id column and its unique constraint from orders.
 * Historical Stripe payment references live on in payment_method/payment_id;
 * this migration drops only the redundant dedicated column.
 */
export class RemoveStripePaymentIntent1762400000000
  implements MigrationInterface
{
  name = 'RemoveStripePaymentIntent1762400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders DROP CONSTRAINT IF EXISTS uq_orders_stripe_payment_intent;
      DROP INDEX IF EXISTS idx_orders_stripe_payment_intent;
      ALTER TABLE orders DROP COLUMN IF EXISTS stripe_payment_intent_id;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS stripe_payment_intent_id varchar(100);
      ALTER TABLE orders DROP CONSTRAINT IF EXISTS uq_orders_stripe_payment_intent;
      ALTER TABLE orders
        ADD CONSTRAINT uq_orders_stripe_payment_intent UNIQUE (stripe_payment_intent_id);
    `);
  }
}
