import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Live } from './live';

@Schema({ timestamps: true, collection: 'requests' })
export class Request {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Live.name, required: true })
  live_id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  user_username: string;

  @Prop({ required: true })
  user_nickname: string;

  @Prop({ required: true })
  user_picture: string;

  @Prop({ required: true })
  request: string;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ default: false })
  current: boolean;

  @Prop({ required: true })
  requested_at: Date;

  @Prop()
  completed_at: Date;
}

export const RequestSchema = SchemaFactory.createForClass(Request);

export type RequestDocument = Request & Document;
