import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
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

  private requireUserId(req: AuthenticatedRequest) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Missing authenticated user');
    }
    return userId;
  }

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
  async getPublicPost(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.communityService.getPublicPostById(id);
  }

  @Post('public/community/posts')
  @ApiBearerAuth()
  async createPublicPost(
    @Body() dto: UpsertCommunityPostDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.communityService.create({
      ...dto,
      userId: this.requireUserId(req),
      userEmail: req.user?.email ?? dto.userEmail ?? '',
      status: 'pending_review',
    });
  }

  @Post('public/community/upload')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload image for community post (public)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadCommunityImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const result = await this.uploadService.storeUploadedFile(file, 'community');
    return { url: result.url };
  }

  @Get('public/community/me/reactions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user community reactions' })
  async getMyCommunityReactions(@Req() req: AuthenticatedRequest) {
    return this.communityService.getReactionSummary(this.requireUserId(req));
  }

  @Get('public/community/me/saves')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get posts saved by the current user' })
  async getMySavedCommunityPosts(
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit = 12,
  ) {
    return this.communityService.listSavedPosts(
      this.requireUserId(req),
      +limit,
    );
  }

  @Post('public/community/posts/:id/like')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle like on a post' })
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async likePost(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.communityService.toggleLike(id, this.requireUserId(req));
  }

  @Post('public/community/posts/:id/save')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle save on a post' })
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async savePost(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.communityService.toggleSave(id, this.requireUserId(req));
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
  async getAdminPost(@Param('id', new ParseUUIDPipe()) id: string) {
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
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpsertCommunityPostDto,
  ) {
    return this.communityService.update(id, dto);
  }

  @Patch('admin/community/posts/:id/status')
  @ApiBearerAuth()
  async updateAdminPostStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
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
    @Param('id', new ParseUUIDPipe()) id: string,
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
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('featured') featured: boolean,
  ) {
    return this.communityService.toggleFeatured(id, featured);
  }

  @Delete('admin/community/posts/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft-delete a post' })
  async deleteAdminPost(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.communityService.remove(id);
  }

  @Post('admin/community/posts/:id/restore')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore a soft-deleted post' })
  async restoreAdminPost(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.communityService.restore(id);
  }

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
  async getAdminBrief(@Param('id', new ParseUUIDPipe()) id: string) {
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
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpsertCommunityBriefDto,
  ) {
    return this.communityService.updateBrief(id, dto);
  }

  @Delete('admin/community/briefs/:id')
  @ApiBearerAuth()
  async deleteAdminBrief(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.communityService.removeBrief(id);
  }
}
