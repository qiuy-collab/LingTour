import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Admin - Dashboard')
@ApiBearerAuth()
@Controller('api/v1/admin/dashboard')
export class DashboardController {
  @Get()
  @ApiOperation({ summary: '获取管理后台仪表盘数据' })
  getDashboardStats() {
    const trend = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      trend.push({
        date: dateStr,
        amount: Math.round((isWeekend ? 400 + Math.random() * 300 : 200 + Math.random() * 200) * 100) / 100,
        count: isWeekend ? 5 + Math.floor(Math.random() * 4) : 2 + Math.floor(Math.random() * 3),
      });
    }

    return {
      code: 200,
      message: 'success',
      data: {
        stats: {
          totalUsers: 156,
          totalCities: 8,
          totalRoutes: 24,
          totalProducts: 45,
          totalInterpreters: 12,
          pendingBookings: 3,
          pendingOrders: 5,
        },
        orderTrend: trend,
        bookingModeDist: [
          { mode: 'Hourly Companion', count: 48, percentage: 42.1 },
          { mode: 'Half-Day Explorer', count: 38, percentage: 33.3 },
          { mode: 'Full-Day Immersion', count: 28, percentage: 24.6 },
        ],
        topCities: [
          { city: '广州', citySlug: 'guangzhou', routeCount: 12, bookingCount: 35 },
          { city: '潮州', citySlug: 'chaozhou', routeCount: 8, bookingCount: 27 },
          { city: '湛江', citySlug: 'zhanjiang', routeCount: 5, bookingCount: 19 },
          { city: '梅州', citySlug: 'meizhou', routeCount: 4, bookingCount: 14 },
          { city: '佛山', citySlug: 'foshan', routeCount: 3, bookingCount: 11 },
        ],
      }
    };
  }
}
