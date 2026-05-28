import { Body, Controller, Get, Put, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { HomeService } from './home.service';
import { UpdateHomeConfigDto } from './dto/update-home-config.dto';
import { AuditInterceptor, AuditAction } from '../../common/interceptors/audit.interceptor';

@ApiTags('Home')
@Controller('api/v1')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Public()
  @Get('public/home')
  @ApiOperation({ summary: 'Get home aggregate configuration (public)' })
  async getPublicHome() {
    return this.homeService.getPublicHome();
  }

  @Roles('admin', 'editor')
  @Get('admin/home')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get home configuration (admin)' })
  async getAdminHome() {
    return this.homeService.getAdminHomeConfig();
  }

  @Roles('admin', 'editor')
  @Put('admin/home')
  @ApiBearerAuth()
  @UseInterceptors(AuditInterceptor)
  @AuditAction('update', 'home_config')
  @ApiOperation({ summary: 'Update home configuration (admin)' })
  async updateAdminHome(@Body() dto: UpdateHomeConfigDto) {
    return this.homeService.updateAdminHomeConfig(dto);
  }
}
