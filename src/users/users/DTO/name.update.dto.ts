import { IsString, IsEmail, IsNumber, } from "class-validator";

export class nameUpdateDto{
    @IsEmail()
    email:string
    @IsString()
    newname:string
    
}