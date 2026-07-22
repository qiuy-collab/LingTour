import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateStaffAccountDto } from './dto/create-staff-account.dto';
import { UpdateStaffAccountDto } from './dto/update-staff-account.dto';
import type { Request } from 'express';

@ApiTags('Users')
@Controller('api/v1/admin/users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('admin')
  @Get('staff')
  @ApiOperation({ summary: 'List administrator and editor accounts' })
  async listStaff(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('keyword') keyword?: string,
    @Query('role') role?: 'admin' | 'editor',
    @Query('status') status?: 'active' | 'banned',
  ) {
    return this.usersService.findAllStaff(
      +page,
      +pageSize,
      keyword,
      role,
      status,
    );
  }

  @Roles('admin')
  @Post('staff')
  @ApiOperation({ summary: 'Create an administrator or editor account' })
  async createStaff(@Body() dto: CreateStaffAccountDto) {
    return this.usersService.createStaff(dto);
  }

  @Roles('admin')
  @Patch('staff/:id')
  @ApiOperation({ summary: 'Update an administrator or editor account' })
  async updateStaff(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() dto: UpdateStaffAccountDto,
  ) {
    const actor = request['user'] as { sub?: string };
    return this.usersService.updateStaff(id, dto, actor.sub as string);
  }

  @Roles('admin')
  @Delete('staff/:id')
  @ApiOperation({ summary: 'Delete an administrator or editor account' })
  async deleteStaff(@Req() request: Request, @Param('id') id: string) {
    const actor = request['user'] as { sub?: string };
    return this.usersService.deleteStaff(id, actor.sub as string);
  }

  @Roles('admin', 'editor')
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

  @Roles('admin', 'editor')
  @Get(':id')
  @ApiOperation({ summary: 'Get user detail for admin' })
  async detail(@Param('id') id: string) {
    return this.usersService.findManagedById(id);
  }

  @Roles('admin', 'editor')
  @Patch(':id/profile')
  @ApiOperation({ summary: 'Update user profile for admin' })
  async updateProfile(@Param('id') id: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(id, dto);
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
