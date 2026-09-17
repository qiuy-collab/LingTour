import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: ['active', 'banned'] })
  @IsIn(['active', 'banned'], {
    message: 'status must be one of [active, banned]',
  })
  status: 'active' | 'banned';
}
