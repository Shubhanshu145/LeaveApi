import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { errorService } from 'src/error/error.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './Schema/user.schema';
import { OtpService } from 'src/otp/otp.service';
import { OtpModule } from 'src/otp/otp.module';
import { RedisModule } from 'src/redis/redis.module';
import { S3Service } from 'src/s3/s3.service';

@Module({
  imports:[MongooseModule.forFeature([{
    name :User.name,
    schema: UserSchema 
   }
   ]),OtpModule,RedisModule],
  controllers: [AuthController],
  providers: [AuthService,S3Service,errorService]
})
export class AuthModule {}
