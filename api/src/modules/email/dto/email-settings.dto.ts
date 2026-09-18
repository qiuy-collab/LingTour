import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * SMTP form values. Every field is optional because the admin may submit a
 * partial form (e.g. only the password for a connection test) — missing
 * fields fall back to the stored configuration, and an empty password keeps
 * the existing one instead of wiping it.
 */
export class SaveSmtpSettingsDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  host?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  port?: number;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  username?: string;

  /** Empty string / omitted = keep the stored password. */
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  password?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  fromEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fromName?: string;

  @IsOptional()
  @IsBoolean()
  useTls?: boolean;
}

export class TestSmtpConnectionDto extends SaveSmtpSettingsDto {}

export class SendTestEmailDto extends SaveSmtpSettingsDto {
  @IsEmail()
  to!: string;
}

export class SaveEmailTemplateDto {
  @IsIn(['en'])
  locale!: string;

  @IsString()
  @Length(1, 255)
  subject!: string;

  @IsString()
  @Length(1, 100_000)
  bodyHtml!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class PreviewEmailTemplateDto {
  @IsOptional()
  @IsIn(['en'])
  locale?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100_000)
  bodyHtml?: string;

  @IsOptional()
  @IsObject()
  vars?: Record<string, string>;
}
