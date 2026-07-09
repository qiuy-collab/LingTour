import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import type { Request } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { UploadService } from './upload.service';

@ApiTags('Upload')
@Controller('api/v1/admin/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  private readPositiveInt(
    value: string | undefined,
    fallback: number,
    max?: number,
  ): number {
    const parsed = Number.parseInt(value ?? '', 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
      return fallback;
    }
    return max ? Math.min(parsed, max) : parsed;
  }

  @Roles('admin', 'editor')
  @Get('files')
  @ApiOperation({ summary: 'List uploaded files (media library)' })
  async listFiles(
    @Query('page') page = '1',
    @Query('limit') limit = '30',
    @Query('module') module?: string,
  ) {
    return this.uploadService.listFiles(
      this.readPositiveInt(page, 1),
      this.readPositiveInt(limit, 30, 120),
      module,
    );
  }

  @Roles('admin', 'editor')
  @Get('media')
  @ApiOperation({
    summary: 'Query media files with filters (from media_files table)',
  })
  async queryMedia(
    @Query('page') page = '1',
    @Query('limit') limit = '30',
    @Query('module') module?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.uploadService.queryMediaFiles({
      page: this.readPositiveInt(page, 1),
      limit: this.readPositiveInt(limit, 30, 120),
      module,
      entityType,
      entityId,
      search,
      dateFrom,
      dateTo,
    });
  }

  @Roles('admin', 'editor')
  @Get('media/orphans')
  @ApiOperation({ summary: 'Find files on disk not tracked in media_files' })
  async findOrphans() {
    const orphans = await this.uploadService.findOrphanFiles();
    return { data: orphans, total: orphans.length };
  }

  @Roles('admin', 'editor')
  @Delete('files/:filename')
  @ApiOperation({
    summary: 'Delete an uploaded file and its media_files record',
  })
  async deleteFile(@Param('filename') filename: string) {
    const deleted = await this.uploadService.deleteFile(filename);
    if (!deleted) {
      throw new NotFoundException('File not found');
    }
    return { deleted: true, filename };
  }

  @Roles('admin', 'editor')
  @Post()
  @ApiOperation({ summary: 'Upload file (image)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (jpg, png, webp, max 10MB)',
        },
        module: {
          type: 'string',
          description:
            'Module name for path prefix (cities, routes, shop, etc.)',
        },
        entityType: {
          type: 'string',
          description:
            'Entity type for ownership tracking (city, route, product, etc.)',
        },
        entityId: {
          type: 'string',
          description: 'Entity ID for ownership tracking',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.',
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadFile(
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body('module') module?: string,
    @Body('entityType') entityType?: string,
    @Body('entityId') entityId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const authUser = request['user'] as { sub?: string } | undefined;
    const result = await this.uploadService.storeUploadedFile(file, {
      module,
      entityType,
      entityId,
      uploadedBy: authUser?.sub,
    });

    return {
      url: result.url,
      filename: result.filename,
      mediaFileId: result.mediaFileId,
      module: module ?? null,
      entityType: entityType ?? null,
      entityId: entityId ?? null,
      originalName: file.originalname,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      createdAt: new Date().toISOString(),
    };
  }
}
