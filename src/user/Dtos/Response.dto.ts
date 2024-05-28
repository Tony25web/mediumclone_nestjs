import { Exclude, Expose } from "class-transformer";

export class ResponseDto{
@Expose()
email:string;
@Exclude()
password:string;    
@Expose()
id:number;
@Expose()
username:string
@Expose()
bio:string;
@Expose()
image:string;
@Expose()
token:string;
@Expose()
role:string;
}