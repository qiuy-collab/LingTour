import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { HomeConfig } from './entities/home-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HomeConfig])],
  controllers: [HomeController],
  providers: [HomeService],
  exports: [HomeService],
})
export class HomeModule {}

