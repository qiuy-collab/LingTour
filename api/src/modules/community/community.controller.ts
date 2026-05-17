import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CommunityService } from './community.service';
import { UpsertCommunityPostDto } from './dto/upsert-community-post.dto';
import { UpdateCommunityStatusDto } from './dto/update-community-status.dto';

@ApiTags('Community')
@Controller('api/v1')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Public()
  @Get('public/community/posts')
  @ApiOperation({ summary: 'Get community posts (public)' })
  @ApiQuery({ name: 'channel', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getPublicPosts(
    @Query('channel') channel?: string,
    @Query('q') q?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.communityService.getPublicPosts({ channel, q, page: +page, limit: +limit });
  }

  @Public()
  @Get('public/community/posts/:id')
  async getPublicPost(@Param('id') id: string) {
    return this.communityService.getPublicPostById(id);
  }

  @Public()
  @Post('public/community/posts')
  async createPublicPost(@Body() dto: UpsertCommunityPostDto) {
    return this.communityService.create({ ...dto, status: dto.status ?? 'pending_review' });
  }

  @Get('admin/community/posts')
  @ApiBearerAuth()
  async getAdminPosts(
    @Query('status') status?: string,
    @Query('channel') channel?: string,
    @Query('q') q?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.communityService.listAdmin({ status, channel, q, page: +page, limit: +limit });
  }

  @Get('admin/community/posts/:id')
  @ApiBearerAuth()
  async getAdminPost(@Param('id') id: string) {
    return this.communityService.getAdminById(id);
  }

  @Post('admin/community/posts')
  @ApiBearerAuth()
  async createAdminPost(@Body() dto: UpsertCommunityPostDto) {
    return this.communityService.create(dto);
  }

  @Put('admin/community/posts/:id')
  @ApiBearerAuth()
  async updateAdminPost(@Param('id') id: string, @Body() dto: UpsertCommunityPostDto) {
    return this.communityService.update(id, dto);
  }

  @Patch('admin/community/posts/:id/status')
  @ApiBearerAuth()
  async updateAdminPostStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCommunityStatusDto,
  ) {
    return this.communityService.updateStatus(id, dto.status);
  }

  @Patch('admin/community/posts/:id/review')
  @ApiBearerAuth()
  async reviewAdminPost(
    @Param('id') id: string,
    @Body() dto: UpdateCommunityStatusDto,
  ) {
    return this.communityService.updateStatus(id, dto.status);
  }

  @Patch('admin/community/posts/:id/featured')
  @ApiBearerAuth()
  async toggleFeatured(@Param('id') id: string, @Body('featured') featured: boolean) {
    return this.communityService.toggleFeatured(id, featured);
  }

  @Delete('admin/community/posts/:id')
  @ApiBearerAuth()
  async deleteAdminPost(@Param('id') id: string) {
    return this.communityService.remove(id);
  }
}
