import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class ConfirmBookingDepositDto {
  @ApiProperty({ example: 'LTABC1234' })
  @IsString()
  @MaxLength(32)
  orderNo: string;

  @ApiProperty({ example: 'pi_sandbox_LTABC1234_paid_001' })
  @IsString()
  @MaxLength(100)
  paymentId: string;
}
