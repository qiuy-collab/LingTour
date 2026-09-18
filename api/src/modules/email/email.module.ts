import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailLog } from './entities/email-log.entity';
import { EmailSmtpSettings } from './entities/email-smtp-settings.entity';
import { EmailTemplate } from './entities/email-template.entity';
import { EmailAdminController } from './email-admin.controller';
import { EmailAdminService } from './email-admin.service';
import { MailerService } from './mailer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailSmtpSettings, EmailTemplate, EmailLog]),
  ],
  controllers: [EmailAdminController],
  providers: [EmailAdminService, MailerService],
  exports: [MailerService],
})
export class EmailModule {}
