import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';

@ApiTags('Upload')
@Controller('api/v1/admin/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get('files')
  @ApiOperation({ summary: 'List uploaded files (media library)' })
  async listFiles(
    @Query('page') page = '1',
    @Query('limit') limit = '30',
    @Query('module') module?: string,
  ) {
    return this.uploadService.listFiles(+page, +limit, module);
  }

  @Delete('files/:filename')
  @ApiOperation({ summary: 'Delete an uploaded file' })
  async deleteFile(@Param('filename') filename: string) {
    const deleted = await this.uploadService.deleteFile(filename);
    if (!deleted) {
      throw new NotFoundException('File not found');
    }
    return { deleted: true, filename };
  }

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
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.'), false);
        }
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('module') module?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const result = await this.uploadService.storeUploadedFile(file, module);

    return {
      url: result.url,
      filename: result.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
