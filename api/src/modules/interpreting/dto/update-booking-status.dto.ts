import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class UpdateBookingStatusDto {
  @ApiProperty({
    example: 'contacted',
    enum: ['new', 'read', 'contacted', 'confirmed', 'cancelled'],
  })
  @IsString()
  @IsIn(['new', 'read', 'contacted', 'confirmed', 'cancelled'])
  status: string;
}
