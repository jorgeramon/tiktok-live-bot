import { IRequest } from "@interfaces/request";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request, RequestDocument } from "@schemas/request";
import { Model, Types } from "mongoose";

@Injectable()
export class RequestRepository {

    constructor(
        @InjectModel(Request.name) private readonly model: Model<Request>
    ) { }

    async findByLiveId(live_id: string): Promise<IRequest[]> {
        const documents: RequestDocument[] = await this.model
            .find({ live_id: new Types.ObjectId(live_id) });

        return documents.map(document => document.toJSON()) as IRequest[];
    }

    async findByLiveIdAndUserId(live_id: string, user_id: string, completed = false): Promise<IRequest[]> {
        const documents: RequestDocument[] = await this.model
            .find({ live_id: new Types.ObjectId(live_id), user_id, completed })
            .sort('createdAt');

        return documents.map(document => document.toJSON()) as IRequest[];
    }

    async save(data: Partial<IRequest>): Promise<IRequest> {
        const document: RequestDocument = await new this.model(data).save();
        return document.toJSON() as IRequest;
    }

    async update(_id: string, data: Partial<IRequest>): Promise<void> {
        await this.model.findByIdAndUpdate(_id, { $set: { ...data } });
    }
}