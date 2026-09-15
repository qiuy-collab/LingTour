import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import nodemailer from 'nodemailer';
import { IsNull, MoreThan, Repository } from 'typeorm';
import {
  EmailVerificationCode,
  type EmailVerificationPurpose,
} from './entities/email-verification-code.entity';
import { UsersService } from '../users/users.service';

type SendCodeResult = {
  email: string;
  purpose: EmailVerificationPurpose;
  expiresInSeconds: number;
  delivery: 'email' | 'development';
  devCode?: string;
};

@Injectable()
export class EmailVerificationService {
  private readonly ttlSeconds = 10 * 60;
  private readonly maxAttempts = 5;

  constructor(
    @InjectRepository(EmailVerificationCode)
    private readonly codeRepository: Repository<EmailVerificationCode>,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async sendCode(
    emailInput: string,
    purpose: EmailVerificationPurpose,
  ): Promise<SendCodeResult> {
    const email = this.normalizeEmail(emailInput);
    await this.assertPurposeAllowed(email, purpose);

    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const expiresAt = new Date(Date.now() + this.ttlSeconds * 1000);

    await this.codeRepository.update(
      { email, purpose, consumedAt: IsNull() },
      { consumedAt: new Date() },
    );

    const record = this.codeRepository.create({
      email,
      purpose,
      codeHash: await bcrypt.hash(code, 10),
      expiresAt,
      consumedAt: null,
      attempts: 0,
    });
    await this.codeRepository.save(record);

    const delivered = await this.sendEmail(email, code, purpose);
    return {
      email,
      purpose,
      expiresInSeconds: this.ttlSeconds,
      delivery: delivered ? 'email' : 'development',
      ...(delivered ? {} : { devCode: code }),
    };
  }

  async consumeCode(
    emailInput: string,
    purpose: EmailVerificationPurpose,
    code: string,
  ) {
    const email = this.normalizeEmail(emailInput);
    const record = await this.codeRepository.findOne({
      where: {
        email,
        purpose,
        consumedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });

    if (!record) {
      throw new UnauthorizedException('Verification code is invalid or expired');
    }
    if (record.attempts >= this.maxAttempts) {
      record.consumedAt = new Date();
      await this.codeRepository.save(record);
      throw new UnauthorizedException('Verification code is invalid or expired');
    }

    const valid = await bcrypt.compare(code, record.codeHash);
    if (!valid) {
      record.attempts += 1;
      await this.codeRepository.save(record);
      throw new UnauthorizedException('Verification code is invalid or expired');
    }

    record.consumedAt = new Date();
    await this.codeRepository.save(record);
    return { email, purpose };
  }

  private async assertPurposeAllowed(
    email: string,
    purpose: EmailVerificationPurpose,
  ) {
    const existing = await this.usersService.findByEmail(email);
    if (purpose === 'signup' && existing) {
      throw new ConflictException('This email is already in use');
    }
    if (purpose === 'login') {
      if (!existing) {
        throw new NotFoundException('No Culvoy account uses this email');
      }
      if (existing.status !== 'active') {
        throw new UnauthorizedException('This account is disabled');
      }
    }
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private async sendEmail(
    email: string,
    code: string,
    purpose: EmailVerificationPurpose,
  ): Promise<boolean> {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT') || 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const from =
      this.configService.get<string>('SMTP_FROM') ||
      'Culvoy <no-reply@culvoy.com>';

    if (!host || !user || !pass) {
      return false;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const action = purpose === 'signup' ? 'create your Culvoy account' : 'log in to Culvoy';
    await transporter.sendMail({
      from,
      to: email,
      subject: 'Your Culvoy verification code',
      text: `Use ${code} to ${action}. This code expires in 10 minutes.`,
      html: `<p>Use <strong>${code}</strong> to ${action}.</p><p>This code expires in 10 minutes.</p>`,
    });
    return true;
  }
}
