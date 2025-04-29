// NestJS
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

// Local
import { Account } from './account';

@Schema({ timestamps: true, collection: 'lives' })
export class Live {

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: Account.name, required: true })
    account_id: MongooseSchema.Types.ObjectId;

    @Prop({ required: true, unique: true })
    stream_id: bigint;
}

export const LiveSchema =
    SchemaFactory.createForClass(Live);

export type LiveDocument = Live & Document;