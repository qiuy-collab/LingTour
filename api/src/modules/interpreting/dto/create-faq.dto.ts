import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateFaqDto {
  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  sortOrder: number;

  @ApiProperty({
    example: 'Is this a tour guide service?',
  })
  @IsString()
  question: string;

  @ApiProperty({
    example: {
      en: 'It is designed as cultural interpreting...',
    },
  })
  @IsString()
  answer: string;

  @ApiPropertyOptional({ default: 'interpreting' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  category?: string;
}
