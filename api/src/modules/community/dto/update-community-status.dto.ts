import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  COMMUNITY_POST_STATUSES,
  type CommunityPostStatus,
} from '../entities/community-post.entity';

export class UpdateCommunityStatusDto {
  @ApiProperty({
    enum: COMMUNITY_POST_STATUSES,
    example: 'published',
    description:
      'pending_review = 待审, published = 已发布, hidden = 已隐藏（不删除）',
  })
  @IsIn(COMMUNITY_POST_STATUSES as unknown as string[])
  status: CommunityPostStatus;

  @ApiPropertyOptional({
    description: '退回 / 隐藏的说明（仅运营内部留痕，不对外展示）',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
