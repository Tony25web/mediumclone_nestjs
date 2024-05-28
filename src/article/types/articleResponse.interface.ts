import { ArticleType } from "./article.type";

export interface ArticleResponseInterface{
articles:ArticleType[],
articleCount?:number
}