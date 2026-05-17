import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('api/v1/admin/users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List users for admin' })
  async list(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
  ) {
    return this.usersService.findAllAdmin(+page, +pageSize, keyword, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user detail for admin' })
  async detail(@Param('id') id: string) {
    return this.usersService.findManagedById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update user status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'active' | 'banned',
  ) {
    return this.usersService.updateStatus(id, status);
  }
}
