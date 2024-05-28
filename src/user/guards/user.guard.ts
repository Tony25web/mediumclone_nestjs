import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { ExpressRequestInterface } from "../../types/expressRequestInterface";
import { Roles } from "../decorators/roles.decorator";

@Injectable()
export class UserGuard implements CanActivate{
    constructor(private reflector:Reflector){}
canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const roles= this.reflector.get(Roles,context.getHandler());
    if(!roles){
        return true
    }
 const request=context.switchToHttp().getRequest<ExpressRequestInterface>();
 const user=request.user;   
 return this.MatchRoles(user.role,roles)   
}
MatchRoles(userRole:string,roles:string[]):boolean{
if(!roles.includes(userRole)){
return false
}
return true
}
}