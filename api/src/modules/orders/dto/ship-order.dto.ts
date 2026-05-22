import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ShipOrderDto {
  @ApiPropertyOptional({ example: 'SF1234567890' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  trackingNo?: string;
}
