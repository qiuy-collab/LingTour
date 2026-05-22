import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { HomeService } from './home.service';
import { UpdateHomeConfigDto } from './dto/update-home-config.dto';

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

  @Get('admin/home')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get home configuration (admin)' })
  async getAdminHome() {
    return this.homeService.getAdminHomeConfig();
  }

  @Put('admin/home')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update home configuration (admin)' })
  async updateAdminHome(@Body() dto: UpdateHomeConfigDto) {
    return this.homeService.updateAdminHomeConfig(dto);
  }
}
