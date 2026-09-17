import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn } from 'class-validator';

export class SendEmailCodeDto {
  @ApiProperty({ example: 'traveler@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: ['login', 'signup'] })
  @IsIn(['login', 'signup'])
  purpose: 'login' | 'signup';
}
