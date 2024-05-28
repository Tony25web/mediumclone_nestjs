import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class updateUserDto {
  @IsString()
  readonly username: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  readonly bio: string;

  @IsString()
  readonly image: string;
}
