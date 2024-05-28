import { hash } from "bcryptjs";
import {Entity,PrimaryGeneratedColumn,Column, BeforeInsert, OneToMany,ManyToMany,JoinTable} from "typeorm"
import { ArticleEntity } from "../article/article.entity";


@Entity({name:"users"})
export class UserEntity{
@PrimaryGeneratedColumn()
id:number;
@Column()
username:string;
@Column({default:""})
bio:string;
@Column()
email:string;
//{select:false} for excluding the field from being returned by the query builder
@Column()
password:string;
@Column({default:"user"})
role:string;
@Column({default:""})
image:string;
@OneToMany(type=>ArticleEntity,(article)=>article.author)
articles:ArticleEntity[];
@BeforeInsert()
async hashPassword(){
this.password=await hash(this.password,16)
}
@ManyToMany(()=>ArticleEntity)
@JoinTable()
favorites:ArticleEntity[];
}