import { Body, Controller, Get, Param, Put, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  AuditInterceptor,
  AuditAction,
} from '../../common/interceptors/audit.interceptor';
import { EmailAdminService } from './email-admin.service';
import {
  PreviewEmailTemplateDto,
  SaveEmailTemplateDto,
  SaveSmtpSettingsDto,
  SendEventTestEmailDto,
  SendTestEmailDto,
  TestSmtpConnectionDto,
} from './dto/email-settings.dto';

/**
 * Admin「邮箱设置」endpoints. SMTP credentials are admin-only: the form
 * round-trips a masked view (never the password itself), and the POST probes
 * accept draft form values so the admin can verify a configuration before
 * saving it.
 *
 * Two distinct test sends exist on purpose: `smtp/test-send` proves the relay
 * itself works with a hardcoded probe, while `templates/:eventKey/test-send`
 * renders the real event template (active DB template or built-in default) —
 * the only way to confirm what a traveller actually receives.
 */
@ApiTags('Email Settings')
@ApiBearerAuth()
@Roles('admin')
@Controller('api/v1/admin/email-settings')
export class EmailAdminController {
  constructor(private readonly emailAdminService: EmailAdminService) {}

  @Get('smtp')
  @ApiOperation({ summary: 'Get the effective SMTP configuration (password masked)' })
  async getSmtpSettings() {
    return this.emailAdminService.getSmtpView();
  }

  @Put('smtp')
  @UseInterceptors(AuditInterceptor)
  @AuditAction('update', 'email-smtp-settings')
  @ApiOperation({ summary: 'Save SMTP configuration (empty password keeps the stored one)' })
  async saveSmtpSettings(@Body() dto: SaveSmtpSettingsDto) {
    return this.emailAdminService.saveSmtpSettings(dto);
  }

  @Post('smtp/test')
  @ApiOperation({ summary: 'Verify the SMTP connection with the given or stored credentials' })
  async testSmtpConnection(@Body() dto: TestSmtpConnectionDto) {
    return this.emailAdminService.testSmtpConnection(dto);
  }

  @Post('smtp/test-send')
  @ApiOperation({ summary: 'Send a hardcoded SMTP connectivity probe email' })
  async sendTestEmail(@Body() dto: SendTestEmailDto) {
    return this.emailAdminService.sendTestEmail(dto);
  }

  @Get('templates')
  @ApiOperation({ summary: 'List email events with their stored and default templates' })
  async listTemplates() {
    return this.emailAdminService.listTemplateEvents();
  }

  @Put('templates/:eventKey')
  @UseInterceptors(AuditInterceptor)
  @AuditAction('update', 'email-template')
  @ApiOperation({ summary: 'Save the template for one event + locale pair' })
  async saveTemplate(
    @Param('eventKey') eventKey: string,
    @Body() dto: SaveEmailTemplateDto,
  ) {
    return this.emailAdminService.saveTemplate(eventKey, dto);
  }

  @Post('templates/:eventKey/preview')
  @ApiOperation({ summary: 'Render a template with example variables for preview' })
  async previewTemplate(
    @Param('eventKey') eventKey: string,
    @Body() dto: PreviewEmailTemplateDto,
  ) {
    return this.emailAdminService.previewTemplate(eventKey, dto);
  }

  @Post('templates/:eventKey/test-send')
  @ApiOperation({
    summary:
      'Render the real event template and send it, to verify traveller-facing output',
  })
  async sendEventTestEmail(
    @Param('eventKey') eventKey: string,
    @Body() dto: SendEventTestEmailDto,
  ) {
    return this.emailAdminService.sendEventTestEmail(eventKey, dto);
  }
}
