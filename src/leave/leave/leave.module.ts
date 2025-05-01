import { Module } from '@nestjs/common';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/auth/auth/Schema/user.schema';
import { Leave, LeaveSchema } from './Schema/leave.schema';
import { errorService } from 'src/error/error.service';
import { AuthModule } from 'src/auth/auth/auth.module';
import { successService } from 'src/success/success.service';

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
    ]),AuthModule
  ],
  controllers: [LeaveController],
  providers: [LeaveService,errorService,successService],
})
export class LeaveModule {}
