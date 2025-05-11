import { ILive } from "@interfaces/live";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Live, LiveDocument } from "@schemas/live";
import { Model } from "mongoose";

@Injectable()
export class LiveRepository {

    constructor(
        @InjectModel(Live.name) private readonly model: Model<Live>
    ) { }

    async save(data: Partial<ILive>): Promise<ILive> {
        const document: LiveDocument = await new this.model(data).save();
        return document.toJSON() as ILive;
    }

    async findOneByStreamId(stream_id: string): Promise<ILive | null> {
        const document: LiveDocument | null = await this.model.findOne({ stream_id });
        return document !== null ? document.toJSON() as ILive : null;
    }

    async findCurrentOnline(account_id: string): Promise<ILive | null> {
        const document: LiveDocument | null = await this.model.findOne({ account_id, is_online: true });
        return document !== null ? document.toJSON() as ILive : null;
    }

    async updateStatusById(_id: string, is_online = false): Promise<void> {
        await this.model.findByIdAndUpdate(_id, { $set: { is_online } });
    }
}