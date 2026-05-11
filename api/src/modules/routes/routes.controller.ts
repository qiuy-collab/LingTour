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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Routes')
@Controller('api/v1')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  // ── Public routes ──

  @Public()
  @Get('public/routes')
  @ApiOperation({ summary: 'Get published routes (public)' })
  @ApiQuery({ name: 'city_slug', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAllPublic(
    @Query('city_slug') citySlug?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.routesService.findAllPublished(citySlug, +page, +limit);
  }

  @Public()
  @Get('public/routes/:slug')
  @ApiOperation({ summary: 'Get route detail by slug (public)' })
  async findBySlug(@Param('slug') slug: string) {
    return this.routesService.findBySlugPublished(slug);
  }

  @Public()
  @Get('public/routes/stats')
  @ApiOperation({ summary: 'Get published route count' })
  async getStats() {
    return this.routesService.getStats();
  }

  // ── Admin routes ──

  @Get('admin/routes')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List routes (admin, paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'size', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'culture', required: false })
  @ApiQuery({ name: 'published', required: false })
  async findAllAdmin(
    @Query('page') page = 1,
    @Query('size') size = 20,
    @Query('q') q?: string,
    @Query('culture') culture?: string,
    @Query('published') published?: string,
  ) {
    return this.routesService.findAllAdmin(
      +page,
      +size,
      q,
      culture,
      published !== undefined ? published === 'true' : undefined,
    );
  }

  @Get('admin/routes/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get route by ID (admin)' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.routesService.findByIdAdmin(id);
  }

  @Post('admin/routes')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new route (with stops & city links)' })
  async create(@Body() dto: CreateRouteDto) {
    return this.routesService.create(dto);
  }

  @Put('admin/routes/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a route (full replacement)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRouteDto,
  ) {
    return this.routesService.update(id, dto);
  }

  @Patch('admin/routes/:id/publish')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a route' })
  async publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.routesService.publish(id);
  }

  @Patch('admin/routes/:id/unpublish')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unpublish a route' })
  async unpublish(@Param('id', ParseUUIDPipe) id: string) {
    return this.routesService.unpublish(id);
  }

  @Delete('admin/routes/:id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a route' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.routesService.softDelete(id);
  }
}
