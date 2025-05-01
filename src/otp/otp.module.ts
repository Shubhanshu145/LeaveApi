import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';

import { RedisModule } from '../redis/redis.module';
import { MailerService } from './mailer.service';
import { errorService } from 'src/error/error.service';

@Module({
  imports: [RedisModule],
  //   controllers: [OtpController],
  providers: [OtpService, MailerService,errorService],
  exports: [OtpService],
})
export class OtpModule {}
