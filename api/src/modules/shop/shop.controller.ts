import {
  Controller,
  Get,
  Post,
  Put,
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
import { ShopService } from './shop.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { SetFeaturedDto } from './dto/set-featured.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Shop')
@Controller('api/v1')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  // ── Public: Collections ──

  @Public()
  @Get('public/shop/collections')
  @ApiOperation({ summary: 'Get published collections' })
  async getCollections() {
    return this.shopService.findAllCollections();
  }

  // ── Public: Products ──

  @Public()
  @Get('public/shop/products')
  @ApiOperation({ summary: 'List published products (paginated, filterable)' })
  @ApiQuery({ name: 'collection', required: false })
  @ApiQuery({ name: 'tag', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getProducts(
    @Query('collection') collection?: string,
    @Query('tag') tag?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 12,
  ) {
    return this.shopService.findAllProducts(collection, tag, +page, +limit);
  }

  @Public()
  @Get('public/shop/products/:slug')
  @ApiOperation({ summary: 'Get product detail by slug' })
  async getProductBySlug(@Param('slug') slug: string) {
    return this.shopService.findBySlugPublished(slug);
  }

  @Public()
  @Get('public/shop/featured')
  @ApiOperation({ summary: 'Get featured products for homepage' })
  @ApiQuery({ name: 'section', required: false })
  async getFeatured(@Query('section') section = 'shop') {
    return this.shopService.getFeatured(section);
  }

  // ── Admin: Collections ──

  @Get('admin/shop/collections')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all collections (admin)' })
  async getAdminCollections() {
    return this.shopService.findAllCollectionsAdmin();
  }

  @Post('admin/shop/collections')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create collection' })
  async createCollection(@Body() dto: CreateCollectionDto) {
    return this.shopService.createCollection(dto);
  }

  @Get('admin/shop/collections/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get collection by ID (admin)' })
  async getAdminCollection(@Param('id', ParseUUIDPipe) id: string) {
    return this.shopService.findCollectionByIdAdmin(id);
  }

  @Put('admin/shop/collections/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update collection' })
  async updateCollection(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCollectionDto,
  ) {
    return this.shopService.updateCollection(id, dto);
  }

  @Delete('admin/shop/collections/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete collection' })
  async deleteCollection(@Param('id', ParseUUIDPipe) id: string) {
    return this.shopService.deleteCollection(id);
  }

  // ── Admin: Products ──

  @Get('admin/shop/products')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List products (admin, paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'collectionId', required: false })
  @ApiQuery({ name: 'q', required: false })
  async getAdminProducts(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('collectionId') collectionId?: string,
    @Query('q') q?: string,
  ) {
    return this.shopService.findAllProductsAdmin(
      +page,
      +limit,
      collectionId,
      q,
    );
  }

  @Post('admin/shop/products')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create product' })
  async createProduct(@Body() dto: CreateProductDto) {
    return this.shopService.createProduct(dto);
  }

  @Get('admin/shop/products/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get product by ID (admin)' })
  async getAdminProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.shopService.findProductByIdAdmin(id);
  }

  @Put('admin/shop/products/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product' })
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.shopService.updateProduct(id, dto);
  }

  @Delete('admin/shop/products/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete product' })
  async deleteProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.shopService.softDeleteProduct(id);
  }

  // ── Admin: Featured ──

  @Get('admin/shop/featured')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get featured entries (admin)' })
  @ApiQuery({ name: 'section', required: false })
  async getAdminFeatured(@Query('section') section = 'shop') {
    return this.shopService.getFeaturedAdmin(section);
  }

  @Put('admin/shop/featured')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set featured product order' })
  async setFeatured(@Body() dto: SetFeaturedDto) {
    return this.shopService.setFeatured('shop', dto.productIds);
  }
}
