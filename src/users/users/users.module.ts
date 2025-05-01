import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/auth/auth/Schema/user.schema';
import { Leave, LeaveSchema } from 'src/leave/leave/Schema/leave.schema';
import { S3Service } from 'src/s3/s3.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Leave.name,
        schema: LeaveSchema,
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, S3Service],
})
export class UsersModule {}
