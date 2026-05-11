import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ArrayMaxSize } from 'class-validator';

export class SetFeaturedDto {
  @ApiProperty({
    type: [String],
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
    description: 'Ordered list of product UUIDs for featured section',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(12)
  productIds: string[];
}
