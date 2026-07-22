import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationsService } from './notifications.service';

interface StaffRequest extends Request {
  user: { sub: string };
}

@ApiTags('Admin - Notifications')
@ApiBearerAuth()
@Roles('admin', 'editor')
@Controller('api/v1/admin/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for the current staff account' })
  findAll(@Req() req: StaffRequest, @Query() query: NotificationQueryDto) {
    return this.notificationsService.findAll(req.user.sub, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  getUnreadCount(@Req() req: StaffRequest) {
    return this.notificationsService.getUnreadCount(req.user.sub);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@Req() req: StaffRequest) {
    return this.notificationsService.markAllAsRead(req.user.sub);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  markAsRead(@Req() req: StaffRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.markAsRead(req.user.sub, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  remove(@Req() req: StaffRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.remove(req.user.sub, id);
  }
}
