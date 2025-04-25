import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeaveDocument = Leave & Document;

@Schema({ timestamps: true })
export class Leave {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  leaveType: 'Planned Leave' | 'Emergency Leave';

  @Prop({ type: [Date], required: true })
  leaveDates: Date[];

  @Prop({ default: 'Pending' })
  status: string; // Pending | Approved | Rejected
}

export const LeaveSchema = SchemaFactory.createForClass(Leave);
