// NestJS
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

// Schemas
import { Request, RequestDocument } from "@schemas/request";

// Interfaces
import { IRequest } from "@interfaces/request";

// NPM
import { Model } from "mongoose";

@Injectable()
export class RequestRepository {

    constructor(
        @InjectModel(Request.name) private readonly model: Model<Request>
    ) { }

    async save(data: Partial<IRequest>): Promise<IRequest> {
        const document: RequestDocument = await new this.model(data).save();
        return document.toJSON() as IRequest;
    }
}