import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn } from 'class-validator';
import type { EmailVerificationPurpose } from '../entities/email-verification-code.entity';

export class SendEmailCodeDto {
  @ApiProperty({ example: 'traveler@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: ['login', 'signup'] })
  @IsIn(['login', 'signup'])
  purpose: EmailVerificationPurpose;
}
