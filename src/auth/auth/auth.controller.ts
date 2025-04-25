import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './DTO/signup.dto';
import { LoginDto } from './DTO/login.dto';
import { OtpService } from 'src/otp/otp.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { RedisService } from 'src/redis/redis.service';
import { uploadUrlDto } from './DTO/upload.url.dto';
import { S3Service } from 'src/s3/s3.service';
import { ObjectId } from 'mongoose';
import { verifyOtpDto } from './DTO/verify.otp.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService:AuthService,
        private otpService:OtpService,
        private redis:RedisService,
        private s3Service:S3Service
    ){}
    @Post('signup')
    async signup(@Body() signupData:SignupDto){
    return this.authService.signup(signupData);
  }

  @Post('login')
  async login(@Body() credentials:LoginDto){
    return this.authService.login(credentials);
  }
  @Post('forget-password')
  async forget(@Body('email') email:string){
    await this.authService.forgetPassword(email);
    return this.otpService.sendOtp(email);
  }
  
  @Post('send-otp')
  @UseGuards(AuthGuard)
  async sendOtp(@Body('email') email: string) {
    await this.otpService.sendOtp(email);
    return { message: 'OTP sent' };
  }
  @Post('verify-otp')
  async verifyOtp(@Body() body: verifyOtpDto) {
    const {email,otp,newpassword}=body;
    
    
    const isValid = await this.otpService.verifyOtp(email,otp);
    console.log(isValid)
    if(!isValid){
        return "Not Verified"
    }
    this.authService.changepassword(email,newpassword);
   
  }
  @Post('reset-passwrod')
  async resetPassword(@Body('email') email:string){
    await this.otpService.sendOtp(email)
    console.log("Otp Sent Successfully");
  }


  @Post('generate-url')
    async generateUploadUrl(@Body() body: uploadUrlDto): Promise<{ url: string }> {
      const { filename, contentType,userID } = body;
      const key = `images/${Date.now()}-${filename}`;
      await this.authService.savekey(key,userID);
      const url = await this.s3Service.generatePreSignedUrl(key, contentType);
      return { url };
    }

    
  @Post('download-url')
  async getDownloadUrl(@Body('email') email:string): Promise<any> {
    const key = await this.authService.findkey(email);
    console.log(key)
    const expiresIn = 3600;
    const responseData = await this.s3Service.getDownloadUrl(
      key,
      expiresIn,
    );
    return responseData;
   }
}
