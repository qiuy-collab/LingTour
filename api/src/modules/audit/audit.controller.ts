import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto/audit-query.dto';

@ApiTags('Admin - Audit Logs')
@ApiBearerAuth()
@Controller('api/v1/admin/audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * GET /api/v1/admin/audit-logs/stats
   * MUST be registered before /:id to avoid "stats" being treated as an id.
   */
  @Roles('admin', 'editor')
  @Get('stats')
  @ApiOperation({ summary: '获取审计日志统计数据' })
  async getStats() {
    return this.auditService.getStats();
  }

  /**
   * GET /api/v1/admin/audit-logs
   * Paginated list with optional filters.
   */
  @Roles('admin', 'editor')
  @Get()
  @ApiOperation({ summary: '获取审计日志列表（分页 + 筛选）' })
  async findAll(@Query() query: AuditQueryDto) {
    return this.auditService.findAll(query);
  }

  /**
   * GET /api/v1/admin/audit-logs/:id
   * Single audit log detail.
   */
  @Roles('admin', 'editor')
  @Get(':id')
  @ApiOperation({ summary: '获取单条审计日志详情' })
  async findOne(@Param('id') id: string) {
    return this.auditService.findOne(id);
  }
}
