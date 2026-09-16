import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FaqItemDto {
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
}

export class SetFaqsDto {
  @ApiProperty({ type: [FaqItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  faqs: FaqItemDto[];
}
