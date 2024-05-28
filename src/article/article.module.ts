import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from '@app/article/article.entity';
import { UserEntity } from '../user/user.entity';
import { FollowEntity } from '../profile/follow.entity';

@Module({
  imports:[TypeOrmModule.forFeature([ArticleEntity,UserEntity,FollowEntity])],
  controllers:[ArticleController],
  providers: [ArticleService]
})
export class ArticleModule {}
