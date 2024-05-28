import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createArticleDto } from './dtos/createArticle.dto';
import { ArticleEntity } from './article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import slugify from 'slugify';
import { QueryStringInterface } from './types/Query.interface';
import { FollowEntity } from '../profile/follow.entity';
import { ArticleType } from './types/article.type';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepo: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepo: Repository<FollowEntity>,
  ) {}
  async createArticle(currentUser: UserEntity, article: createArticleDto) {
    const createdArticle = new ArticleEntity();
    Object.assign(createdArticle, article);
    if (!createdArticle.tagList) {
      createdArticle.tagList = [];
    }
    createdArticle.author = currentUser;
    createdArticle.slug = this.getSlug(article.title);
    return await this.articleRepo.save(createdArticle);
  }
  buildArticleResponse(articles: ArticleType): ArticleResponseInterface {
    return {
      articles:[articles],
    };
  }
  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
  async getArticleBySlug(slug: string): Promise<ArticleEntity> {
    return this.articleRepo.findOne({ where: { slug } });
  }
  async deleteArticle(slug: string, userId: number): Promise<DeleteResult> {
    const article = await this.getArticleBySlug(slug);
    if (!article) {
      throw new NotFoundException(
        'the article you are trying to delete does not exist',
      );
    }
    if (userId !== article.author.id) {
      throw new ForbiddenException(
        'you are not allowed to delete this article',
      );
    }
    return await this.articleRepo.delete({ slug });
  }

  async updateArticle(
    slug: string,
    userId: number,
    body: Partial<ArticleEntity>,
  ): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);
    if (!article) {
      throw new NotFoundException(
        'the article you are trying to delete does not exist',
      );
    }
    if (userId !== article.author.id) {
      throw new ForbiddenException(
        'you are not allowed to delete this article',
      );
    }
    if (!body.slug) {
      article.slug = this.getSlug(body.title);
    }
    Object.assign(article, body);
    return await this.articleRepo.save(article);
  }
  async findAllArticles(currentUserId: number, query: QueryStringInterface) {
    const queryBuilder = this.articleRepo
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .orderBy('articles.createdAt', 'DESC');
    if (query.favorite) {
      const author = await this.userRepo.findOne({
        where: { username: query.favorite },
        relations: ['favorites'],
      });
      const articleIds = author.favorites.map((article) => article.id);
      if (articleIds.length > 0) {
        queryBuilder.andWhere('articles.id IN (:...articleIds)', {
          articleIds,
        });
      } else {
        queryBuilder.andWhere('1=0');
      }
    }
    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }
    if (query.limit) {
      queryBuilder.limit(query.limit);
    }
    if (query.offset) {
      queryBuilder.offset(query.offset);
    }
    if (query.author) {
      const author = await this.userRepo.findOne({
        where: { username: query.author },
      });
      queryBuilder.andWhere('articles.author=:author', { author: author.id });
    }
    let favoriteIds: number[] = [];
    if (currentUserId) {
      const currentUser = await this.userRepo.findOne({
        where: { id: currentUserId },
        relations: ['favorites'],
      });
      favoriteIds = currentUser.favorites.map((favorite) => favorite.id);
    }
    const articles = await queryBuilder.getMany();
    const articlesCount = await queryBuilder.getCount();
    const articlesWithFavorite = articles.map((article) => {
      const favorited = favoriteIds.includes(article.id);
      return { ...article, favorited };
    });
    return { articles: articlesWithFavorite, articlesCount };
  }
  async addArticleToFavorites(
    slug: string,
    userId: number,
  ): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });
    const isNotFavorite = user.favorites.findIndex(
      (articleInFavorite) => articleInFavorite.id === article.id,
    );
    if (isNotFavorite !== -1) {
      throw new BadRequestException(
        'the Article has already been added to favorites',
      );
    }
    user.favorites.push(article);
    article.favoritesCount++;
    await this.userRepo.save(user);
    await this.articleRepo.save(article);
    return article;
  }
  async DeleteArticleFromFavorites(
    slug: string,
    userId: number,
  ): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });
    const isNotFavorite = user.favorites.findIndex(
      (articleInFavorite) => articleInFavorite.id === article.id,
    );
    if (isNotFavorite === -1) {
      throw new BadRequestException(
        'the Article has already been removed from favorites',
      );
    }
    user.favorites.splice(isNotFavorite, 1);
    article.favoritesCount--;
    await this.userRepo.save(user);
    await this.articleRepo.save(article);
    return article;
  }
  async getFeed(
    currentUserId: number,
    query: QueryStringInterface,
  ): Promise<ArticleResponseInterface> {
    let follows = [] as FollowEntity[];
    if (currentUserId !== null) {
      follows = await this.followRepo.find({
        where: { followerId: currentUserId },
      });
    }
console.log(follows);
    if (follows.length === 0) {
      return { articles: [], articleCount: 0 };
    }
    const followingUserIds=follows.map(follow=>follow.followingId)
    const queryBuilder = this.articleRepo
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .where("articles.authorId IN (:...ids)",{ids:followingUserIds})
      .orderBy("articles.createdAt","DESC")
      ; 
      if(query.limit){
        queryBuilder.limit(query.limit)
      }
      if(query.offset){
        queryBuilder.offset(query.offset)
      }
      const articles=await queryBuilder.getMany();
      const articleCount= await queryBuilder.getCount()
      return {articles,articleCount}
  }
}
