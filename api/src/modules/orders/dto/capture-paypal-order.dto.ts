import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CapturePayPalOrderDto {
  @ApiProperty({ example: '5O190127TN364715T' })
  @IsString()
  @MaxLength(100)
  paypalOrderId: string;
}
