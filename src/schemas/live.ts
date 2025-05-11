import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Account } from './account';

@Schema({ timestamps: true, collection: 'lives' })
export class Live {

    @Prop({ type: Types.ObjectId, ref: Account.name, required: true })
    account_id: MongooseSchema.Types.ObjectId;

    @Prop({ required: true, unique: true })
    stream_id: string;

    @Prop({ default: true })
    is_online: boolean;
}

export const LiveSchema =
    SchemaFactory.createForClass(Live);

export type LiveDocument = Live & Document;