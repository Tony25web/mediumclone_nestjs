import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { UserGuard } from '../user/guards/user.guard';
import { Roles } from '../user/decorators/roles.decorator';
import { User } from '../user/decorators/user.decorator';
import { createArticleDto } from './dtos/createArticle.dto';
import { UserEntity } from '../user/user.entity';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import { ArticlesResponseInterface } from './types/ArticlesResponse.interface';
import { QueryStringInterface } from './types/Query.interface';
import { BackendPipe } from '../shared/pipes/backendValidation.pipe';
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}
  @Post()
  @Roles(['user'])
  @UseGuards(UserGuard)
  @UsePipes(new BackendPipe())
  async createArticle(
    @User() currentUser: UserEntity,
    @Body('article') article: createArticleDto,
  ): Promise<ArticleResponseInterface> {
    const createdArticle = await this.articleService.createArticle(
      currentUser,
      article,
    );
    return this.articleService.buildArticleResponse(createdArticle);
  }
  @Get('feed')
  @UseGuards(UserGuard)
  async getFeed(
    @User('id') currentUserId: number,
    @Query() query: QueryStringInterface,
  ): Promise<ArticleResponseInterface> {
    return this.articleService.getFeed(currentUserId, query)
  }
  @Get()
  async findAllArticles(
    @User('id') id: number,
    @Query() query: QueryStringInterface,
  ): Promise<ArticlesResponseInterface> {
    console.log(id);
    return this.articleService.findAllArticles(id, query);
  }
  @Get(':slug')
  async getArticle(
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.getArticleBySlug(slug);
    return this.articleService.buildArticleResponse(article);
  }
  @Delete(':slug')
  @Roles(['user'])
  @UseGuards(UserGuard)
  async deleteArticle(@User('id') userId: number, @Param('slug') slug: string) {
    return await this.articleService.deleteArticle(slug, userId);
  }
  @Put(':slug')
  @Roles(['user'])
  @UsePipes(new BackendPipe())
  @UseGuards(UserGuard)
  async updateArticle(
    @User('id') userId: number,
    @Param('slug') slug: string,
    @Body('article') article: createArticleDto,
  ): Promise<ArticleResponseInterface> {
    const updatedArticle = await this.articleService.updateArticle(
      slug,
      userId,
      article,
    );
    return this.articleService.buildArticleResponse(updatedArticle);
  }
  @Post(':slug/favorite')
  @Roles(['user'])
  @UseGuards(UserGuard)
  async addArticleToFavorites(
    @User('id') userId: number,
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.addArticleToFavorites(
      slug,
      userId,
    );
    return this.articleService.buildArticleResponse(article);
  }
  @Delete(':slug/favorite')
  @Roles(['user'])
  @UseGuards(UserGuard)
  async DeleteArticleFromFavorites(
    @User('id') userId: number,
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.DeleteArticleFromFavorites(
      slug,
      userId,
    );
    return this.articleService.buildArticleResponse(article);
  }
}
