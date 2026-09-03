import { Global, Module } from '@nestjs/common';
import { PublicContentCacheService } from './public-content-cache.service';

@Global()
@Module({
  providers: [PublicContentCacheService],
  exports: [PublicContentCacheService],
})
export class PublicContentCacheModule {}
