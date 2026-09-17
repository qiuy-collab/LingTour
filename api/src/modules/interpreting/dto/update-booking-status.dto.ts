import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

/**
 * Full booking status vocabulary, including the deposit flow values the
 * public checkout writes (deposit_pending → deposit_paid). Without them an
 * admin could move a deposit booking onto the regular track and never get
 * back (report P1-6).
 */
export const BOOKING_STATUSES = [
  'new',
  'read',
  'contacted',
  'deposit_pending',
  'deposit_paid',
  'confirmed',
  'completed',
  'cancelled',
] as const;

export class UpdateBookingStatusDto {
  @ApiProperty({
    example: 'contacted',
    enum: BOOKING_STATUSES,
  })
  @IsString()
  @IsIn(BOOKING_STATUSES)
  status: string;
}
