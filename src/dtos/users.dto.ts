import { IsEmail, IsString } from 'class-validator';
import { Role, User } from '@interfaces/users.interface';

export class CreateUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  public password: string;
}

export class UserProfileDto {

  constructor(user: User) {
    this.email = user.email;
    this.roles = user.roles;
  }

  public email: string;
  public roles: Role[];
}
