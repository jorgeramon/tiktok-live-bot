// NestJS
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// Local
import { Live } from './live';

// NPM
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'requests' })
export class Request {

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: Live.name, required: true })
    live_id: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    user_id: bigint;

    @Prop({ required: true })
    user_nickname: string;

    @Prop({ required: true })
    user_picture: string;

    @Prop({ required: true })
    request: string;
}

export const RequestSchema =
    SchemaFactory.createForClass(Request);

export type RequestDocument = Request & Document;