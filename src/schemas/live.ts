// NestJS
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// Local
import { Account } from './account';

// NPM
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'lives' })
export class Live {

    @Prop({ type: Types.ObjectId, ref: Account.name, required: true })
    account_id: MongooseSchema.Types.ObjectId;

    @Prop({ required: true, unique: true })
    stream_id: bigint;

    @Prop({ default: true })
    is_online: boolean;
}

export const LiveSchema =
    SchemaFactory.createForClass(Live);

export type LiveDocument = Live & Document;