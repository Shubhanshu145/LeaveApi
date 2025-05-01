import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({timestamps:true})
export class ForgetPassword extends Document {
  

  @Prop({ required: true,type:String})
  userId: string;

  @Prop({ type: Date, default: Date.now })
  resetRequestDate: Date;

  @Prop({default: 'forget-password',
    enum: ['forget-password', 'reset-password']})
  method: string;

  @Prop({default:1})
  status:string;  //1->Required || 2->Skip || 3->Reset

}
export const ForgetPasswordSchema = SchemaFactory.createForClass(ForgetPassword);
