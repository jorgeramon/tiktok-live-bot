// NestJS
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// Local
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'accounts' })
export class Account {

    @Prop({ required: true, unique: true })
    nickname: string;
}

export const AccountSchema =
    SchemaFactory.createForClass(Account);

export type AccountDocument = Account & Document;