import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 订单履约状态。
 * 关注「这个订单走到了哪一步」，不混淆是否付了钱。
 *
 * - pending: 已下单，等待支付（绝大多数订单创建后初始状态）
 * - confirmed: 已支付（或免支付），等待运营处理 / 备货
 * - shipped: 已发货
 * - delivered: 已送达
 * - cancelled: 取消
 */
export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/**
 * 支付状态。
 * 关注「钱有没有到」，与履约状态正交。
 *
 * - unpaid: 未支付（订单创建后默认）
 * - paid: 已支付
 * - failed: 支付失败（用户支付通道返回失败）
 * - refunded: 已退款
 */
export const PAYMENT_STATUSES = [
  'unpaid',
  'paid',
  'failed',
  'refunded',
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32, unique: true, name: 'order_no' })
  orderNo: string;

  @Index()
  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 255, name: 'guest_email', nullable: true })
  guestEmail: string | null;

  /**
   * 履约状态（不再表达支付状态）。
   * 历史订单 'paid' 已通过 migration 迁移为 'confirmed'。
   */
  @Index()
  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: OrderStatus;

  /**
   * 支付状态。新订单创建时默认 'unpaid'，由支付回调更新。
   */
  @Index()
  @Column({
    type: 'varchar',
    length: 20,
    default: 'unpaid',
    name: 'payment_status',
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'payment_method',
    nullable: true,
  })
  paymentMethod: string | null;

  @Column({ type: 'varchar', length: 100, name: 'payment_id', nullable: true })
  paymentId: string | null;

  /**
   * 支付完成时间（来自支付回调）。
   */
  @Column({ type: 'timestamptz', name: 'paid_at', nullable: true })
  paidAt: Date | null;

  /**
   * 支付失败原因（如果有）。
   */
  @Column({
    type: 'varchar',
    length: 500,
    name: 'payment_failure_reason',
    nullable: true,
  })
  paymentFailureReason: string | null;

  @Column({ type: 'jsonb', name: 'shipping_addr' })
  shippingAddr: Record<string, any>;

  @Column({ type: 'varchar', length: 100, name: 'tracking_no', nullable: true })
  trackingNo: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'refund_reason',
    nullable: true,
  })
  refundReason: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
