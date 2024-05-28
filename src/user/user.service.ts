import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserDto } from './Dtos/create-user.dto';
import { UserEntity } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import jwt from "jsonwebtoken";
import { UserResponseI } from './types/userResponse.interface';
import { LogInDto } from './Dtos/LoginIn.dto';
import bcryptjs from "bcryptjs";
import { userType } from './types/user.type';
import { updateUserDto } from './Dtos/updateUser.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async createUser(body: CreateUserDto):Promise<UserEntity> {
  let errors=[]
    const userFound = await this.userRepository.findOne({where:[{email:body.email},{username:body.username}]})
  if(userFound){
    if(userFound.email===body.email){

      errors.push({email:"Email is already exists"})
    }
    if(userFound.username===body.username){

      errors.push({username:"UserName is already exists"})
    }
    throw new BadRequestException({errors})
  }
    const newUser = new UserEntity();
    Object.assign(newUser, body);
    return await this.userRepository.save(newUser);
  }
generateJwtToken(user: UserEntity):string{

  return jwt.sign({id:user.id},process.env.JWT_SECRET,{expiresIn:"1d"})
}
buildUserResponse(user: UserEntity):UserResponseI {
return {
  user:{
    ...user,
    token:this.generateJwtToken(user)
  }
}
}
async login(body:LogInDto):Promise<Omit<UserEntity,"hashPassword">&{token:string}>{
const user=await this.userRepository.findOne({where:{email:body.email}});
if(!user){
  throw new NotFoundException({errors:{email:"User not found"}});
}
const isMatch=await bcryptjs.compare(body.password,user.password)
if(!isMatch){
  throw new BadRequestException({errors:{password:"password is invalid try again"}})
}
return {...user,token:this.generateJwtToken(user)};
}
async findById(userId:number):Promise<UserEntity>{
return this.userRepository.findOne({where:{id:userId}})
}
async updateUser(id:number,body:updateUserDto):Promise<UserEntity>{
const user= await this.findById(id);
Object.assign(user,body);
return await this.userRepository.save(user)
}
}
