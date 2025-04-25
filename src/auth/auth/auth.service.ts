import { BadRequestException, Injectable } from '@nestjs/common';
import { SignupDto } from './DTO/signup.dto';
import { Model, ObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './Schema/user.schema';
import { errorService } from 'src/error/error.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './DTO/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(@InjectModel(User.name) private UserModel:Model<User>,private errorService:errorService,
    
    private jwtService:JwtService){}
    async signup(signupData:SignupDto){
        const {email , name ,phone, password} = signupData
        const emailInUse = await this.UserModel.findOne({
          email:signupData.email
        });
        if(emailInUse){
          return {Message: this.errorService.get("EXIST")};
        }
        const phoneInUse = await this.UserModel.findOne({
          phone:signupData.phone
        });
        if(phoneInUse){
            throw new BadRequestException("Phone number already exists");
        }
        const hashedPassword = await bcrypt.hash(password,10);
        await this.UserModel.create({
          name,
          email,
          phone,
          password:hashedPassword,
          
        }) 
      }

      async login(credentials:LoginDto){
        const {email,password} = credentials;
        const user = await this.UserModel.findOne({email});
        if(!user){
          throw new BadRequestException("Invalid credentials")
        }
        
        
        const matchedpassword = await bcrypt.compare(password,user.password) ;
        if(!matchedpassword){
            throw new BadRequestException("Invalid credentials")
        }
        const userID = user._id
        const accessToken = this.jwtService.sign({userID});
         return{
          accessToken
         }
         

         
      }
      
      async forgetPassword(email:string){
        const user = await this.UserModel.findOne({email});
        if(!user){
        throw new BadRequestException("Email does not exist")
    }// check if user status- 
        const useremail = user.email;
        const accessToken = this.jwtService.sign({useremail})
    return {
        accessToken
    };
      }


      async changepassword(email:string,npassword:string){
        const hpassword= await bcrypt.hash(npassword,10)
        await this.UserModel.updateOne({email:email} ,{$set:{password:npassword}})
      }

      async savekey(key:string,userID:string){
        await this.UserModel.updateOne({_id:userID},{$set:{profile_image:key}})
      }
      async findkey(email:string){
        const user = await this.UserModel.findOne({email:email});
        if(!user) throw new BadRequestException("user does not exist")
          console.log(user.profile_image)
        return user.profile_image;
      }
}
