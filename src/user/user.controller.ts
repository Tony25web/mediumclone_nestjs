import { Body, Controller,Get,Post, Put, UseGuards, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './Dtos/create-user.dto';
import { UserResponseI } from './types/userResponse.interface';
import { LogInDto } from './Dtos/LoginIn.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { ResponseDto } from './Dtos/Response.dto';
import { UserEntity } from './user.entity';
import { User } from './decorators/user.decorator';
import { UserGuard } from './guards/user.guard';
import { Roles } from './decorators/roles.decorator';
import { updateUserDto } from './Dtos/updateUser.dto';
import { BackendPipe } from '../shared/pipes/backendValidation.pipe';

@Controller()
export class UserController {
    constructor(private readonly userService: UserService){}
@Post("/users")
@UsePipes(new BackendPipe())
async createUser(@Body("user")body:CreateUserDto):Promise<UserResponseI> {
const user= await this.userService.createUser(body);
return this.userService.buildUserResponse(user);
}
@Post("/login")
@UsePipes(new BackendPipe())
@Serialize(ResponseDto)
async loginInUser(@Body("user") body:LogInDto):Promise<Omit<UserEntity,"hashPassword">&{token:string}>{
 return await this.userService.login(body);
    
}
@Get("user")
@Serialize(ResponseDto)
@Roles(["admin"])
@UseGuards(UserGuard)
getCurrentUser(@User() user:UserEntity){
return this.userService.buildUserResponse(user)
}
@Put("user")
@Roles(["admin"])
@UseGuards(UserGuard)
async UpdateCurrentUser(@User("id") id:number,@Body('user')user:updateUserDto):Promise<UserResponseI>{
const updatedUser=await this.userService.updateUser(id,user);
return this.userService.buildUserResponse(updatedUser)

}
}
