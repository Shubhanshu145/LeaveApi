import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SignupDto } from './DTO/signup.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './Schema/user.schema';
import { errorService } from 'src/error/error.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './DTO/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ForgetPassword } from './Schema/forget.password.schema';
import { successService } from 'src/success/success.service';
import { forgetPasswordDto } from './DTO/forget.password.dto';
import { OtpService } from 'src/otp/otp.service';
import { Forgot } from './interfaces/forgot.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(ForgetPassword.name) private passwordModel: Model<ForgetPassword>,
    private errorService: errorService,private successService:successService,


    private jwtService: JwtService,
    private otpService:OtpService
  ) {}
  async signup(signupData: SignupDto) {
    const { email, name, phone, password } = signupData;
    const emailInUse = await this.UserModel.findOne({
      email: signupData.email,
    });
    if (emailInUse) {
      return {Message:this.errorService.get("EXIST")}
    }
    const phoneInUse = await this.UserModel.findOne({
      phone: signupData.phone,
    });
    if (phoneInUse) {
      return {Message:this.errorService.get("PHONE_InUse")}
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.UserModel.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });
    if (user) {
      return { Message: this.successService.get("SIGNUP SUCCESSFUL") };
    }
  }
 
  async login(credentials: LoginDto) {
    const { email, password } = credentials;
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      return {Message:this.errorService.get("INVALID_CREDENTIALS")}
    }

    const matchedpassword = await bcrypt.compare(password, user.password);
    if (!matchedpassword) {
      return {Message:this.errorService.get("INVALID_CREDENTIALS")}
    }
    const userID = user._id;
    const accessToken = this.jwtService.sign({ userID });
    return {
      Message: this.successService.get("LOGIN_SUCCESSFULL"),accessToken
    };
  }


  async changepassword(email: string, npassword: string) {
    const hpassword = await bcrypt.hash(npassword, 10);
    await this.UserModel.updateOne(
      { email: email },
      { $set: { password: hpassword } },
    );
  }

  async savekey(key: string, userID: string) {
    await this.UserModel.updateOne(
      { _id: userID },
      { $set: { profile_image: key } },
    );
  }
  async findkey(email: string) {
    const user = await this.UserModel.findOne({ email: email });
    if (!user) throw new BadRequestException('user does not exist');
    console.log(user.profile_image);
    return user.profile_image;
  }


  async updateLeaves(userId:string,n:number,lenght:number){
    const user = await this.UserModel.findById(userId);
    if(user){
    user.leaves = (n - lenght).toString();
    await user.save();}
  }

  async userData(userId:string){
    const user= await this.UserModel.findById(userId);
    // console.log(user)
    return user
  
  }
  async forgetPassword(payload: forgetPasswordDto) {
    const { userId, email } = payload;
    
    // Check if user exists
    const user = await this.UserModel.findById(userId);
    if (!user) {
      return { Message: this.errorService.get("EXIST") }; 
    }
  
    const attemptCheck = await this.count(userId);

    if (!attemptCheck.canAttempt) {
      return {
        Message: this.errorService.get("LIMIT_EXHAUSTED"),
        detail: attemptCheck.message
      };
    }
  
    const accessToken = this.jwtService.sign({ email: user.email });
  
    const hi = await this.createEntry(userId);

    await this.otpService.sendOtp(email);
  
    return {
      accessToken,
      Message: this.successService.get("OTP_SEND"),
      attemptsRemaining: attemptCheck.attemptsRemaining - 1
    };
  }
  
  async count(userId: string): Promise<{ 
    canAttempt: boolean; 
    attemptsRemaining: number;
    message?: string 
  }> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
    const attemptsCount = await this.passwordModel.countDocuments({
      userId,
      createdAt: { $gte: twentyFourHoursAgo },
      
    });
    
  
    if (attemptsCount === 0) {
      return { 
        canAttempt: true, 
        attemptsRemaining: 5 
      };
    }
  
    
    if (attemptsCount >= 5) {
      const oldestAttempt = await this.passwordModel.findOne(
        { userId },
        {createdAt: 1}
      ).sort({createdAt: 1})

      const { createdAt } = (oldestAttempt as any).createdAt;

      console.log(createdAt);
      if (oldestAttempt) {
        const hoursElapsed = (Date.now() - new Date(createdAt).getTime()) / (60 * 60 * 1000);
        const hoursToWait = Math.ceil(24 - hoursElapsed);
        
        return { 
          canAttempt: false,
          attemptsRemaining:0,
          message: "Maximum attempts reached. Try again after hours."
        };
      }
    }
  
    return { 
      canAttempt: true,
      attemptsRemaining: 5 - attemptsCount 
    };
  }
  
  async createEntry(userId: string) {
    try {      await this.passwordModel.updateMany(
        { userId, status: '1' },
        { status: '3' } 
      );
      
      
      const newEntry = await this.passwordModel.create({
        userId: userId,
        resetRequestDate: new Date(),
        method: "forget-password",
        status: "1"
      });
     

      return newEntry;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Duplicate active reset request');
      }
      throw error;
    }
  }
}
