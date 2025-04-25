import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';

import { MailerService } from './mailer.service';
import { RedisService } from 'src/redis/redis.service';


@Injectable()
export class OtpService {
  constructor(
     private readonly redis: RedisService,
    private readonly mailerService: MailerService,
  ) {}

  async sendOtp(email: string): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redis.set(`otp:${email}`, otp, 300000); 
    const storedOtp = await this.redis.get(`otp:${email}`);
    console.log(storedOtp)
    await this.mailerService.sendMail(
      email,
      'Your OTP Code',
      `Your OTP is: ${otp}`
    );
  }

  async verifyOtp(email: string, inputOtp: string) :Promise<boolean> {
    console.log(email)
    const storedOtp = await this.redis.get(`otp:${email}`);
    console.log(storedOtp)
    if (storedOtp && storedOtp === inputOtp) {
      await this.redis.del(`otp:${email}`);
      // console.log("otp verified")
      return true;
    }
    return false;
  }
}
