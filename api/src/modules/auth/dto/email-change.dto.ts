import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength } from 'class-validator';

export class RequestEmailChangeDto {
  @ApiProperty({ example: 'new-address@example.com' })
  @IsEmail()
  @MaxLength(180)
  newEmail: string;
}

export class ConfirmEmailChangeDto {
  @ApiProperty({ example: 'new-address@example.com' })
  @IsEmail()
  @MaxLength(180)
  newEmail: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'code must be a 6-digit number' })
  code: string;
}
