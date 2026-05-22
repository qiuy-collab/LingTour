import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { CommunityService } from './community.service';
import { UploadService } from '../upload/upload.service';
import { UpsertCommunityPostDto } from './dto/upsert-community-post.dto';
import { UpdateCommunityStatusDto } from './dto/update-community-status.dto';
import { UpsertCommunityBriefDto } from './dto/upsert-community-brief.dto';
import {
  COMMUNITY_POST_STATUSES,
  type CommunityPostStatus,
} from './entities/community-post.entity';

interface AuthenticatedRequest extends Request {
  user?: { sub?: string; email?: string; role?: string };
}

@ApiTags('Community')
@Controller('api/v1')
export class CommunityController {
  constructor(
    private readonly communityService: CommunityService,
    private readonly uploadService: UploadService,
  ) {}

  @Public()
  @Get('public/community/posts')
  @ApiOperation({ summary: 'Get community posts (public)' })
  @ApiQuery({ name: 'channel', required: false })
  @ApiQuery({ name: 'route', required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'tag', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getPublicPosts(
    @Query('channel') channel?: string,
    @Query('route') route?: string,
    @Query('location') location?: string,
    @Query('tag') tag?: string,
    @Query('q') q?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.communityService.getPublicPosts({
      channel,
      route,
      location,
      tag,
      q,
      page: +page,
      limit: +limit,
    });
  }

  @Public()
  @Get('public/community/posts/:id')
  async getPublicPost(@Param('id') id: string) {
    return this.communityService.getPublicPostById(id);
  }

  @Public()
  @Post('public/community/posts')
  async createPublicPost(@Body() dto: UpsertCommunityPostDto) {
    // 公开端点强制走审核，避免前端绕过
    return this.communityService.create({
      ...dto,
      status: 'pending_review',
    });
  }

  @Public()
  @Post('public/community/upload')
  @ApiOperation({ summary: 'Upload image for community post (public)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for community
    }),
  )
  async uploadCommunityImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const result = this.uploadService.getStructuredPath(file.filename, 'community');
    return { url: result.url };
  }

  @Public()
  @Post('public/community/posts/:id/like')
  @ApiOperation({ summary: 'Toggle like on a post' })
  async likePost(@Param('id') id: string) {
    return this.communityService.incrementEngagement(id, 'likes');
  }

  @Public()
  @Post('public/community/posts/:id/save')
  @ApiOperation({ summary: 'Toggle save on a post' })
  async savePost(@Param('id') id: string) {
    return this.communityService.incrementEngagement(id, 'saves');
  }

  @Get('admin/community/posts')
  @ApiBearerAuth()
  @ApiQuery({ name: 'status', required: false, enum: COMMUNITY_POST_STATUSES })
  @ApiQuery({ name: 'channel', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  async getAdminPosts(
    @Query('status') status?: CommunityPostStatus,
    @Query('channel') channel?: string,
    @Query('q') q?: string,
    @Query('includeDeleted') includeDeleted?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.communityService.listAdmin({
      status,
      channel,
      q,
      includeDeleted: includeDeleted === 'true' || includeDeleted === '1',
      page: +page,
      limit: +limit,
    });
  }

  @Get('admin/community/posts/:id')
  @ApiBearerAuth()
  async getAdminPost(@Param('id') id: string) {
    return this.communityService.getAdminById(id, true);
  }

  @Post('admin/community/posts')
  @ApiBearerAuth()
  async createAdminPost(@Body() dto: UpsertCommunityPostDto) {
    return this.communityService.create(dto);
  }

  @Put('admin/community/posts/:id')
  @ApiBearerAuth()
  async updateAdminPost(
    @Param('id') id: string,
    @Body() dto: UpsertCommunityPostDto,
  ) {
    return this.communityService.update(id, dto);
  }

  @Patch('admin/community/posts/:id/status')
  @ApiBearerAuth()
  async updateAdminPostStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCommunityStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.communityService.updateStatus(id, dto.status, {
      userId: req.user?.sub,
      reason: dto.reason,
    });
  }

  @Patch('admin/community/posts/:id/review')
  @ApiBearerAuth()
  async reviewAdminPost(
    @Param('id') id: string,
    @Body() dto: UpdateCommunityStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.communityService.updateStatus(id, dto.status, {
      userId: req.user?.sub,
      reason: dto.reason,
    });
  }

  @Patch('admin/community/posts/:id/featured')
  @ApiBearerAuth()
  async toggleFeatured(
    @Param('id') id: string,
    @Body('featured') featured: boolean,
  ) {
    return this.communityService.toggleFeatured(id, featured);
  }

  @Delete('admin/community/posts/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '软删除（仍保留记录，可恢复）' })
  async deleteAdminPost(@Param('id') id: string) {
    return this.communityService.remove(id);
  }

  @Post('admin/community/posts/:id/restore')
  @ApiBearerAuth()
  @ApiOperation({ summary: '恢复已软删除的帖子' })
  async restoreAdminPost(@Param('id') id: string) {
    return this.communityService.restore(id);
  }

  // ── Field Briefs (运营给社区抛出的拍摄/记录任务) ──

  @Public()
  @Get('public/community/briefs')
  @ApiOperation({ summary: 'List active community field briefs (public)' })
  async getPublicBriefs() {
    return this.communityService.listPublicBriefs();
  }

  @Get('admin/community/briefs')
  @ApiBearerAuth()
  async getAdminBriefs() {
    return this.communityService.listAdminBriefs();
  }

  @Get('admin/community/briefs/:id')
  @ApiBearerAuth()
  async getAdminBrief(@Param('id') id: string) {
    return this.communityService.getAdminBriefById(id);
  }

  @Post('admin/community/briefs')
  @ApiBearerAuth()
  async createAdminBrief(@Body() dto: UpsertCommunityBriefDto) {
    return this.communityService.createBrief(dto);
  }

  @Put('admin/community/briefs/:id')
  @ApiBearerAuth()
  async updateAdminBrief(
    @Param('id') id: string,
    @Body() dto: UpsertCommunityBriefDto,
  ) {
    return this.communityService.updateBrief(id, dto);
  }

  @Delete('admin/community/briefs/:id')
  @ApiBearerAuth()
  async deleteAdminBrief(@Param('id') id: string) {
    return this.communityService.removeBrief(id);
  }
}
