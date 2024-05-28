import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { Repository } from 'typeorm';
import { profileType } from './types/profile.type';
import { ProfileInterface } from './types/profileResponse.interface';
import { FollowEntity } from './follow.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepo: Repository<FollowEntity>,
  ) {}
  async findOne(id: number, username: string): Promise<profileType> {
    const profile = await this.userRepo.findOne({ where: { username } });
    if (!profile) {
      throw new NotFoundException('profile not found');
    }
    console.log(`Profile:${profile.id},userId:${id}`)
    const follow = await this.followRepo.findOne({
      where: { followerId: id, followingId: profile.id },
    });
    console.log(follow)
    delete profile.password;
    return { ...profile, following: follow ? true : false };
  }

  buildProfileResponse(profile: profileType): ProfileInterface {
    delete profile.email;
    return {
      profile,
    };
  }
  async followProfile(
    currentUserId: number,
    profileUserName: string,
  ): Promise<profileType> {
    const profile = await this.userRepo.findOne({
      where: { username: profileUserName },
    });
    if (!profile) {
      throw new NotFoundException(`User's profile not found`);
    }
    if (currentUserId === profile.id) {
      throw new BadRequestException(`You can't follow yourself`);
    }
    const follow = await this.followRepo.findOne({
      where: { followerId: currentUserId, followingId: profile.id },
    });
    if (!follow) {
      const createFollow = new FollowEntity();
      createFollow.followerId = currentUserId;
      createFollow.followingId = profile.id;
      await this.followRepo.save(createFollow);
    }
    return { ...profile, following: true };
  }
  async unFollowProfile(
    currentUserId: number,
    profileUserName: string,
  ): Promise<profileType> {
    const profile = await this.userRepo.findOne({
      where: { username: profileUserName },
    });
    if (!profile) {
      throw new NotFoundException(`User's profile not found`);
    }
    await this.followRepo.delete({
      followerId: currentUserId,
      followingId: profile.id,
    });
    return { ...profile, following: false };
  }
}
