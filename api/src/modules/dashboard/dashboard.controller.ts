import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('Admin - Dashboard')
@ApiBearerAuth()
@Controller('api/v1/admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles('admin', 'editor')
  @Get()
  @ApiOperation({ summary: '获取管理后台仪表盘数据（实时数据库统计）' })
  async getDashboardStats() {
    return this.dashboardService.getDashboardStats();
  }
}
