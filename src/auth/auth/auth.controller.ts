import { Body, Controller, HttpException, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './DTO/signup.dto';
import { LoginDto } from './DTO/login.dto';
import { OtpService } from 'src/otp/otp.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { RedisService } from 'src/redis/redis.service';
import { uploadUrlDto } from './DTO/upload.url.dto';

import { verifyOtpDto } from './DTO/verify.otp.dto';

import { UsersGuard } from './guards/users.guard';
import { S3Service } from 'src/s3/s3.service';
import { AnalyticsS3ExportFileFormat } from '@aws-sdk/client-s3';
import {ForgetPassword } from './Schema/forget.password.schema';
import { forgetPasswordDto } from './DTO/forget.password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private otpService: OtpService,
    private redis: RedisService,
    private s3Service: S3Service,
  ) {}
  @Post('signup')
  async signup(@Body() signupData: SignupDto) {
    return this.authService.signup(signupData);
  }

  @Post('login')
  async login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }
  @Post('forget-password')
async forget(@Body() payload: forgetPasswordDto) {
  

    const result = await this.authService.forgetPassword(payload); // error hai

    if (result.accessToken) {
      return {
        success: true,
        data: {
          token: result.accessToken,
          attemptsRemaining: result.attemptsRemaining
        },
        message: result.Message,
        detail: result.detail
      };
    }
    
    return {
      success: false,
      message: result.Message,
      detail: result.detail || 'Failed to process forget password request'
    };
  
}
  
  @Post('send-otp')
  @UseGuards(AuthGuard)
  async sendOtp(@Body('email') email: string) {
    await this.otpService.sendOtp(email);
    return { message: 'OTP sent' };
  }
  @Post('verify-otp')
  @UseGuards(AuthGuard)
  async verifyOtp(@Body() body: verifyOtpDto) {
    const { email, otp, newpassword } = body;

    const isValid = await this.otpService.verifyOtp(email, otp);
    console.log(isValid);
    if (!isValid) {
      return 'Not Verified';
    }
    this.authService.changepassword(email, newpassword);
  }
  @Post('reset-passwrod')
  async resetPassword(@Body('email') email: string) {
    await this.otpService.sendOtp(email);
    console.log('Otp Sent Successfully');
  }

  @Post('generate-url')
  @UseGuards(UsersGuard)
  async generateUploadUrl(
    @Body() body: uploadUrlDto,
  ): Promise<{ url: string }> {
    const { filename, contentType, userID } = body;
    const key = `images/${Date.now()}-${filename}`;
    await this.authService.savekey(key, userID);
    const url = await this.s3Service.generatePreSignedUrl(key,contentType);
    return { url };
  }

  @Post('download-url')
  @UseGuards(AuthGuard)
  async getDownloadUrl(@Body('email') email: string): Promise<{ url: string }> {
    const key = await this.authService.findkey(email);
    console.log(key);
    const expiresIn = 3600;
    const url = await this.s3Service.getDownloadUrl(key, expiresIn);
    return { url };
  }
}
