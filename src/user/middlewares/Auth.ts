import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Response } from "express"
import jwt from "jsonwebtoken"
import { ExpressRequestInterface } from "../../types/expressRequestInterface";
import { UserService } from "../user.service";
import { jwtPayload } from "../../types/jwt";
@Injectable()
export class AuthMiddleware implements NestMiddleware{
    constructor(private userService: UserService){}
     async use(req: ExpressRequestInterface, _: Response, next: NextFunction) {
       if(!req.headers.authorization){
        req.user=null
        next()
        return;
       }
       const token=req.headers.authorization.split(" ")[1];
       if(token){
        try {
         const decodeToken= jwt.verify(token,process.env.JWT_SECRET)as jwtPayload;
         const user=await this.userService.findById(+(decodeToken.id));
         req.user=user;
         next()
        } catch (error) {
            req.user=null
            next(error)
        }
       }

     }

}