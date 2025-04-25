import { IsString, IsEmail, IsNumber, } from "class-validator";

export class verifyOtpDto{
    @IsEmail()
    email:string
   @IsString()
   otp:string
    @IsString()
    newpassword:string
    
}