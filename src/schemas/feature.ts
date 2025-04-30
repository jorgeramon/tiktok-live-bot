// NestJS
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// Local
import { Account } from './account';

// NPM
import { Document, Schema as MongooseSchema } from 'mongoose';

// Enums
import { FeatureType } from '@enums/feature-type';

export class QueueFeature {
    prefix: string | null;
    add_variants: string[];
}

@Schema({ timestamps: true, collection: 'features' })
export class Feature {

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: Account.name, required: true })
    account_id: MongooseSchema.Types.ObjectId;

    @Prop({ required: true, enum: Object.values(FeatureType) })
    type: FeatureType;

    @Prop({ default: false })
    enabled: boolean;

    @Prop({ type: MongooseSchema.Types.Mixed })
    config: QueueFeature | null;
}

export const FeatureSchema =
    SchemaFactory.createForClass(Feature);

export type FeatureDocument = Feature & Document;