import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  async healthCheck() {
    try {
      await this.dataSource.query('SELECT 1');
      return {
        status: 'ok',
        database: 'up',
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'down',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
