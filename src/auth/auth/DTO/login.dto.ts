import { IsString, IsEmail, IsNumber, } from "class-validator";

export class LoginDto{
    @IsEmail()
    email:string
   
    @IsString()
    password:string
    
}