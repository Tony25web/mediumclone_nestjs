import { UseInterceptors,NestInterceptor,ExecutionContext,CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { plainToInstance } from "class-transformer";
// represent  a class annotation
interface ClassConstructor {
   new (...args: any[]):{}
}
export function Serialize(dto:ClassConstructor){
return UseInterceptors(new SerializeInterceptor(dto))
}


export class SerializeInterceptor implements NestInterceptor{
   constructor(private dto:ClassConstructor){}
   intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any>{
     // here we can run anything we want BEFORE the request is handled by the (request)route handler 
     return next.handle().pipe(map((data:any)=>{
       return plainToInstance(this.dto,data,{excludeExtraneousValues:true})
// here we can run anything we want AFTER the request is handled by the (request)route handler

}))
}
}