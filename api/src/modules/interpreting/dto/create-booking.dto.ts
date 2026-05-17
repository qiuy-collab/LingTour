import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  MaxLength,
  IsBoolean,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'John Smith' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  @MaxLength(300)
  contact: string;

  @ApiProperty({ example: 'Zhanjiang' })
  @IsString()
  @MaxLength(200)
  city: string;

  @ApiProperty({ example: '2026-06-15' })
  @IsDateString()
  serviceDate: string;

  @ApiProperty({ example: 'Story route guided support' })
  @IsString()
  @MaxLength(200)
  supportMode: string;

  @ApiPropertyOptional({ example: '1-2' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  groupSize?: string;

  @ApiPropertyOptional({ example: 'Interested in the seafood route...' })
  @IsOptional()
  @IsString()
  routeOrNeed?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  fastTrack?: boolean;
}
