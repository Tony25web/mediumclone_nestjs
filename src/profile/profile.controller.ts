import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { User } from '../user/decorators/user.decorator';
import { ProfileInterface } from './types/profileResponse.interface';
import { Roles } from '../user/decorators/roles.decorator';
import { UserGuard } from '../user/guards/user.guard';
@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username') 
  async findProfile(@User("id")currentUserId:number,@Param('username') profileUsername: string):Promise<ProfileInterface> {
    const profile=await this.profileService.findOne(currentUserId,profileUsername);
    return this.profileService.buildProfileResponse(profile)

  }
  @Post(':username/follow')
  @Roles(["user"])
  @UseGuards(UserGuard)
  async followProfile(
    @User('id') currentUserId: number,
    @Param('username') profileUserName: string,
  ): Promise<ProfileInterface> {
    const profile=await this.profileService.followProfile(currentUserId,profileUserName);
    return this.profileService.buildProfileResponse(profile)
  }
  @Delete(':username/unfollow')
  @Roles(["user"])
  @UseGuards(UserGuard)
  async unFollowProfile(
    @User('id') currentUserId: number,
    @Param('username') profileUserName: string,
  ): Promise<ProfileInterface> {
    const profile=await this.profileService.unFollowProfile(currentUserId,profileUserName);
    return this.profileService.buildProfileResponse(profile)
  }
}
