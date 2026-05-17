import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Admin - Dashboard')
@ApiBearerAuth()
@Controller('api/v1/admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: '获取管理后台仪表盘数据（实时数据库统计）' })
  async getDashboardStats() {
    const data = await this.dashboardService.getDashboardStats();
    return {
      code: 200,
      message: 'success',
      data,
    };
  }
}
