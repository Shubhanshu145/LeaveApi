import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema()
export class forgetPassword extends Document {
  
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true , default:0})
  count: number;

  @Prop({ type: Date, default: Date.now })
  resetRequestDate: Date;

}
export const forgetPasswordSchema = SchemaFactory.createForClass(forgetPassword);
