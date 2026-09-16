import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ProfileItemDto {
  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  sortOrder: number;

  @ApiProperty({ example: 'Culture Route Lead' })
  @IsString()
  name: string;

  @ApiProperty({
    example: {
      en: 'English / Mandarin / Cantonese support',
    },
  })
  @IsString()
  language: string;

  @ApiProperty({
    example: 'Guangdong city history...',
  })
  @IsString()
  focus: string;

  @ApiProperty({ default: [] })
  @IsArray()
  @IsString({ each: true })
  helps: string[];
}

export class SetProfilesDto {
  @ApiProperty({ type: [ProfileItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProfileItemDto)
  profiles: ProfileItemDto[];
}
