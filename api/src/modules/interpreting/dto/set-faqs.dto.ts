import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { IsI18nObject } from '../../../common/validators/i18n.validator';

export class FaqItemDto {
  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  sortOrder: number;

  @ApiProperty({
    example: { en: 'Is this a tour guide service?', zh: '这是导游服务吗？' },
  })
  @IsI18nObject()
  question: { en: string; zh: string };

  @ApiProperty({
    example: {
      en: 'It is designed as cultural interpreting...',
      zh: '它被设计为文化口译...',
    },
  })
  @IsI18nObject()
  answer: { en: string; zh: string };
}

export class SetFaqsDto {
  @ApiProperty({ type: [FaqItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  faqs: FaqItemDto[];
}
