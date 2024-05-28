import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { TagModule } from '@app/tag/tag.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '@app/user/user.controller';
import { UserService } from '@app/user/user.service';
import { UserModule } from '@app/user/user.module';
import {config} from '@app/ormconfig'
import { UserEntity } from './user/user.entity';
import dotenv from "dotenv";
import { AuthMiddleware } from './user/middlewares/Auth';
import { ArticleController } from './article/article.controller';
import { ArticleModule } from './article/article.module';
import { ArticleService } from './article/article.service';
import { ArticleEntity } from './article/article.entity';
import { ProfileModule } from './profile/profile.module';
import { FollowEntity } from './profile/follow.entity';
dotenv.config()
@Module({
  imports: [TypeOrmModule.forRoot(config),TypeOrmModule.forFeature([UserEntity,ArticleEntity,FollowEntity]),TagModule,UserModule, ArticleModule, ProfileModule,],
  controllers: [AppController, UserController, ArticleController],
  providers: [AppService, UserService,ArticleService],
})
export class AppModule {
  configure(consumer:MiddlewareConsumer){
    consumer.apply(AuthMiddleware).forRoutes("*")
  }
}
