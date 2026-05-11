import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoryRoute } from './entities/story-route.entity';
import { RouteStop } from './entities/route-stop.entity';
import { RouteCityLink } from './entities/route-city-link.entity';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StoryRoute, RouteStop, RouteCityLink])],
  controllers: [RoutesController],
  providers: [RoutesService],
  exports: [RoutesService],
})
export class RoutesModule {}
