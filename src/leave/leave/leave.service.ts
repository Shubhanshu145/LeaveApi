import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Leave, LeaveDocument } from './Schema/leave.schema';
import { User } from 'src/auth/auth/Schema/user.schema';
import { errorService } from 'src/error/error.service';
import { AuthService } from 'src/auth/auth/auth.service';
import { successService } from 'src/success/success.service';

@Injectable()
export class LeaveService {
  constructor(
    @InjectModel(Leave.name) private leaveModel: Model<LeaveDocument>,
    private errorService:errorService,
    private authService:AuthService,
    private successService:successService
  ) {}

  async applyLeave(userId: string, leaveType: string, from: Date, to: Date) {
    // const user = await this.userModel.findById(userId);
    const user = await this.authService.userData(userId)
    // console.log(user);
    if (!user) throw new BadRequestException('User not found');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const now = new Date();
    const start = new Date(from);
    const end = new Date(to);

    if (start > end) return{Message:this.errorService.get("Date_Range")};

    const leaveDates: Date[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const copy = new Date(d);
      const threeDaysAgo = new Date(now);
      threeDaysAgo.setDate(now.getDate() - 3);
      if (copy < threeDaysAgo) {
        return {Message:this.errorService.get("Leave_More_Than_3days")}
      }
      leaveDates.push(new Date(copy));
    }
    
    const n = parseInt(user.leaves);

    const existingLeaves = await this.leaveModel.find({ userId });
    // console.log(existingLeaves)
    const alreadyUsedDays = existingLeaves.reduce((acc, leave) => {
      return acc + (leave.leaveDates?.length || 0);
    }, 0);

    if (alreadyUsedDays + leaveDates.length > 6) {
      return{Message:this.errorService.get("More_than_6days")}
    }

    if (leaveDates.length > n) {
      throw new BadRequestException(`You only have ${n} leave days left`);
    }

    const overlap = await this.leaveModel.findOne({
      userId,
      leaveDates: { $in: leaveDates },
    });

    if (overlap) return {Message:this.errorService.get("Already_Applied")}

    const leave = await this.leaveModel.create({
      userId,
      leaveType,
      leaveDates,
    });

    await this.authService.updateLeaves(userId,n,leaveDates.length)
    // user.leaves = (n - leaveDates.length).toString();
    // await user.save();

    return {Message:this.successService.get("Leave_Applied")};
  }

  async getLeaves(userId: string, type?: string, page = 1, limit = 10) {
    const query: any = { userId };
    if (type) query.leaveType = type;

    return this.leaveModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async getLeaveById(userId: string, leaveId: string) {
    return this.leaveModel.findOne({ _id: leaveId, userId });
  }
}
