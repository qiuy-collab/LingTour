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
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Cities')
@Controller('api/v1')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  // ── Public routes ──

  @Public()
  @Get('public/cities')
  @ApiOperation({ summary: 'Get published cities (public)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAllPublic(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.citiesService.findAllPublished(+page, +limit);
  }

  @Public()
  @Get('public/cities/:slug')
  @ApiOperation({ summary: 'Get city detail by slug (public)' })
  async findBySlug(@Param('slug') slug: string) {
    return this.citiesService.findBySlugPublished(slug);
  }

  // ── Admin routes ──

  @Get('admin/cities')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all cities (admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAllAdmin(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.citiesService.findAllAdmin(+page, +limit);
  }

  @Get('admin/cities/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get city by ID (admin)' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.citiesService.findByIdAdmin(id);
  }

  @Post('admin/cities')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new city' })
  async create(@Body() dto: CreateCityDto) {
    return this.citiesService.create(dto);
  }

  @Put('admin/cities/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a city (full replacement)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCityDto,
  ) {
    return this.citiesService.update(id, dto);
  }

  @Patch('admin/cities/:id/publish')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a city' })
  async publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.citiesService.publish(id);
  }

  @Patch('admin/cities/:id/unpublish')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unpublish a city' })
  async unpublish(@Param('id', ParseUUIDPipe) id: string) {
    return this.citiesService.unpublish(id);
  }

  @Delete('admin/cities/:id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a city' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.citiesService.softDelete(id);
  }
}
