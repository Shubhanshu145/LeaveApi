import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';


import { Leave, LeaveDocument } from './Schema/leave.schema';
import { User } from 'src/auth/auth/Schema/user.schema';

@Injectable()
export class LeaveService {
  constructor(
    @InjectModel(Leave.name) private leaveModel: Model<LeaveDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async applyLeave(userId: string, leaveType: string, from: Date, to: Date) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');
  
    const now = new Date();
    const start = new Date(from);
    const end = new Date(to);
  
    if (start > end) throw new BadRequestException('Invalid date range');
  
    
    const leaveDates: Date[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const copy = new Date(d);
      const threeDaysAgo = new Date(now);
      threeDaysAgo.setDate(now.getDate() - 3);
      if (copy < threeDaysAgo) {
        throw new BadRequestException(
          'Cannot apply for leave more than 3 days back',
        );
      }
      leaveDates.push(new Date(copy));
    }
  
   
    const n = parseInt(user.leaves);
  
    
    const existingLeaves = await this.leaveModel.find({ userId });
    const alreadyUsedDays = existingLeaves.reduce((acc, leave) => {
      return acc + (leave.leaveDates?.length || 0);
    }, 0);
  
   
    if (alreadyUsedDays + leaveDates.length > 6) {
      throw new BadRequestException(
        'Cannot apply for more than 6 total leave days',
      );
    }
  
    
    if (leaveDates.length > n) {
      throw new BadRequestException(
        `You only have ${n} leave days left`,
      );
    }
  
    
    const overlap = await this.leaveModel.findOne({
      userId,
      leaveDates: { $in: leaveDates },
    });
  
    if (overlap) throw new BadRequestException('Leave date already applied');
  
    
    const leave = await this.leaveModel.create({
      userId,
      leaveType,
      leaveDates,
    });
  
    
    user.leaves = (n - leaveDates.length).toString();
    await user.save();
  
    return leave;
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
