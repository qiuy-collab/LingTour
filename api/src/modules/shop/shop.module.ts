import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreProduct } from './entities/store-product.entity';
import { StoreCollection } from './entities/store-collection.entity';
import { FrontendFeatured } from './entities/featured.entity';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([StoreProduct, StoreCollection, FrontendFeatured]),
  ],
  controllers: [ShopController],
  providers: [ShopService],
  exports: [ShopService],
})
export class ShopModule {}
