// NestJS
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

// Schemas
import { Live, LiveDocument } from "@schemas/live";

// Interfaces
import { ILive } from "@interfaces/live";

// NPM
import { Model } from "mongoose";

@Injectable()
export class LiveRepository {

    constructor (
        @InjectModel(Live.name) private readonly model: Model<Live>
    ) {}

    async save(data: Partial<ILive>): Promise<ILive> {
        const document: LiveDocument = await new this.model(data).save();
        return document.toJSON() as ILive;
    }

    async findOneByStreamId(stream_id: bigint): Promise<ILive | null> {
        const document: LiveDocument | null = await this.model.findOne({ stream_id });
        return document !== null ? document.toJSON() as ILive : null;
    }

    async findCurrentOnline(account_id: string): Promise<ILive | null> {
        const document: LiveDocument | null = await this.model.findOne({ account_id, is_online: true });
        return document !== null ? document.toJSON() as ILive : null;
    }

    async setOfflineStatus(account_id: string): Promise<void> {
        const live: ILive | null = await this.findCurrentOnline(account_id);

        if (live !== null) {
            await this.model.findByIdAndUpdate(live._id, { $set: { is_online: false } });
        }
    }
}