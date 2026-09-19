import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

const STAFF_ACCESS = ['admin', 'editor', 'none'] as const;

/**
 * Grants back-office access to an existing traveler account, or takes it away
 * again. `none` keeps the traveler identity and its records; the account itself
 * is never deleted by this endpoint.
 */
export class UpdateUserStaffAccessDto {
  @ApiProperty({
    enum: STAFF_ACCESS,
    description: 'admin/editor 授予后台权限，none 移除后台权限并保留旅行者身份',
  })
  @IsIn(STAFF_ACCESS)
  role: 'admin' | 'editor' | 'none';
}