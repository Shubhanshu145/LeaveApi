import { Module } from '@nestjs/common';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/auth/auth/Schema/user.schema';
import { Leave, LeaveSchema } from './Schema/leave.schema';

@Module({
  imports:[MongooseModule.forFeature([{
      name :User.name,
      schema: UserSchema 
     },{
    name :Leave.name,
    schema:LeaveSchema}
  ])],
  controllers: [LeaveController],
  providers: [LeaveService]
})
export class LeaveModule {}
