import { IsString, IsEmail } from 'class-validator';

export class forgetPasswordDto {
  @IsString()
  userId:string

  @IsEmail()
  email:string

}
