
import { IsString, IsEmail, IsNumber, } from "class-validator";

export class leaveDto{
    @IsEmail()
    leaveType: string;
   
    @IsString()
    from: string;

    @IsString()
    to: string 
    
}