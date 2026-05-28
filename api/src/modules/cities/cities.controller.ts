import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Header,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditInterceptor, AuditAction } from '../../common/interceptors/audit.interceptor';

@ApiTags('Cities')
@Controller('api/v1')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  // ── Public routes ──

  @Public()
  @Get('public/cities')
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
  @ApiOperation({ summary: 'Get published cities (public)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAllPublic(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.citiesService.findAllPublished(+page, +limit);
  }

  @Public()
  @Get('public/cities/:slug')
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
  @ApiOperation({ summary: 'Get city detail by slug (public)' })
  async findBySlug(@Param('slug') slug: string) {
    return this.citiesService.findBySlugPublished(slug);
  }

  // ── Admin routes ──

  @Roles('admin', 'editor')
  @Get('admin/cities')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all cities (admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAllAdmin(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.citiesService.findAllAdmin(+page, +limit);
  }

  @Roles('admin', 'editor')
  @Get('admin/cities/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get city by ID (admin)' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.citiesService.findByIdAdmin(id);
  }

  @Roles('admin', 'editor')
  @Post('admin/cities')
  @ApiBearerAuth()
  @UseInterceptors(AuditInterceptor)
  @AuditAction('create', 'city')
  @ApiOperation({ summary: 'Create a new city' })
  async create(@Body() dto: CreateCityDto) {
    return this.citiesService.create(dto);
  }

  @Roles('admin', 'editor')
  @Put('admin/cities/:id')
  @ApiBearerAuth()
  @UseInterceptors(AuditInterceptor)
  @AuditAction('update', 'city')
  @ApiOperation({ summary: 'Update a city (full replacement)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCityDto,
  ) {
    return this.citiesService.update(id, dto);
  }

  @Roles('admin', 'editor')
  @Patch('admin/cities/:id/publish')
  @ApiBearerAuth()
  @UseInterceptors(AuditInterceptor)
  @AuditAction('publish', 'city')
  @ApiOperation({ summary: 'Publish a city' })
  async publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.citiesService.publish(id);
  }

  @Roles('admin', 'editor')
  @Patch('admin/cities/:id/unpublish')
  @ApiBearerAuth()
  @UseInterceptors(AuditInterceptor)
  @AuditAction('unpublish', 'city')
  @ApiOperation({ summary: 'Unpublish a city' })
  async unpublish(@Param('id', ParseUUIDPipe) id: string) {
    return this.citiesService.unpublish(id);
  }

  @Delete('admin/cities/:id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseInterceptors(AuditInterceptor)
  @AuditAction('delete', 'city')
  @ApiOperation({ summary: 'Soft delete a city' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.citiesService.softDelete(id);
  }
}
