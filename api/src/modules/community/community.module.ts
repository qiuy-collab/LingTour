import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { CommunityPost } from './entities/community-post.entity';
import { CommunityBrief } from './entities/community-brief.entity';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommunityPost, CommunityBrief]),
    UploadModule,
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
