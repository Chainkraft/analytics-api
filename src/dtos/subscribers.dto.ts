import { IsEmail, IsString } from 'class-validator';

export class AccessRequestDto {

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  company: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;
}
