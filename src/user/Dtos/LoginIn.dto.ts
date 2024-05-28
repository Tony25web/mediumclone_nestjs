import { IsString,IsNotEmpty } from "class-validator";
export class LogInDto{
@IsString()
@IsNotEmpty()
email:string;
@IsString()
@IsNotEmpty()
password:string;    
}