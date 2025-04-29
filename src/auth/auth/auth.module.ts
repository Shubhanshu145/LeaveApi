import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { errorService } from 'src/error/error.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './Schema/user.schema';
import { OtpModule } from 'src/otp/otp.module';
import { RedisModule } from 'src/redis/redis.module';
import { S3Service } from 'src/s3/s3.service';
import { S3Module } from 'src/s3/s3.module';
import { forgetPassword, forgetPasswordSchema } from './Schema/forget.password.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: forgetPassword.name,
        schema: forgetPasswordSchema
      }
    ]),
    OtpModule,
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, errorService, S3Service],
})
export class AuthModule {}
