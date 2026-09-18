import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

/**
 * The order notifications an admin may re-send for an existing order. Kept in
 * step with the ORDER_EMAIL_TITLES allow-list in OrdersService, so the API and
 * the service reject the same set of keys.
 */
export const ORDER_EMAIL_EVENT_KEYS: string[] = [
  'order_created',
  'order_paid',
  'order_shipped',
  'order_refunded',
];

export class ResendOrderEmailDto {
  @ApiProperty({
    enum: ORDER_EMAIL_EVENT_KEYS,
    example: 'order_paid',
    description: '要重发的事件模板 key',
  })
  @IsIn(ORDER_EMAIL_EVENT_KEYS)
  eventKey: string;
}