// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';

// import { LeaveStatus } from '../leave/schemas/leave.schema';
// import { User } from 'src/auth/auth/Schema/user.schema';
// import { Leave } from 'src/leave/leave/Schema/leave.schema';


// @Injectable()
// export class AdminService {
//   constructor(
//     @InjectModel(Leave.name) private leaveModel: Model<Leave>,
//     @InjectModel(User.name) private userModel: Model<User>,
//   ) {}

//   async getAllLeaves(
//     status?: LeaveStatus,
//     page = 1,
//     limit = 10,
//   ) {
//     const query: any = {};
//     if (status) {
//       query.status = status;
//     }

//     const skip = (page - 1) * limit;

//     const [leaves, total] = await Promise.all([
//       this.leaveModel
//         .find(query)
//         .populate('user', 'username -_id')
//         .skip(skip)
//         .limit(limit)
//         .sort({ createdAt: -1 })
//         .exec(),
//       this.leaveModel.countDocuments(query).exec(),
//     ]);

//     return {
//       data: leaves,
//       meta: {
//         total,
//         page,
//         last_page: Math.ceil(total / limit),
//       },
//     };
//   }

//   async updateLeaveStatus(id: string, status: LeaveStatus) {
//     return this.leaveModel
//       .findByIdAndUpdate(
//         id,
//         { status },
//         { new: true },
//       )
//       .populate('user', 'username -_id')
//       .exec();
//   }


// }