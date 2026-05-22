import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import {
  ORDER_STATUSES,
  type OrderStatus,
} from '../entities/order.entity';

/**
 * 管理员手动改履约状态。
 * 不允许直接通过这个端点改支付状态（paymentStatus），
 * 支付状态由支付回调驱动，避免人工介入造成数据偏差。
 */
export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: ORDER_STATUSES,
    example: 'confirmed',
    description: '订单履约状态（pending/confirmed/shipped/delivered/cancelled）',
  })
  @IsIn(ORDER_STATUSES as unknown as string[])
  status: OrderStatus;
}
