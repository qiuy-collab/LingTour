import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@ApiTags('Settings')
@Controller('api/v1')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get('public/settings')
  @ApiOperation({ summary: 'Get public settings payload' })
  async getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  @Get('admin/settings')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get settings (admin)' })
  async getAdminSettings() {
    return this.settingsService.getAdminSettings();
  }

  @Put('admin/settings')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update settings payload (admin)' })
  async updateAdminSettings(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateAdminSettings(dto.payload ?? {});
  }
}

