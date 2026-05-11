import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32, unique: true, name: 'order_no' })
  orderNo: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 255, name: 'guest_email', nullable: true })
  guestEmail: string | null;

  @Index()
  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

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

  @Column({ type: 'jsonb', name: 'shipping_addr' })
  shippingAddr: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
