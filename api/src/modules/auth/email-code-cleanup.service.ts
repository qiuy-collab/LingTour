import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { EmailVerificationCode } from './entities/email-verification-code.entity';

const RETENTION_DAYS = 30;

/**
 * Expired verification codes were never removed from
 * auth_verification_codes (report P2-N): the table only ever grew. A
 * nightly sweep deletes codes older than the retention window — their
 * 10-minute TTL is long gone and the email uniqueness index keeps working.
 */
@Injectable()
export class EmailCodeCleanupService {
  private readonly logger = new Logger(EmailCodeCleanupService.name);

  constructor(
    @InjectRepository(EmailVerificationCode)
    private readonly codeRepository: Repository<EmailVerificationCode>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async purgeExpiredCodes(): Promise<void> {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60_000);
    const result = await this.codeRepository.delete({
      createdAt: LessThan(cutoff),
    });
    if ((result.affected ?? 0) > 0) {
      this.logger.log(
        `Purged ${result.affected} expired email verification codes`,
      );
    }
  }
}
