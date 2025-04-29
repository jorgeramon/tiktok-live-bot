// NestJS
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

// Schemas
import { Request } from "@schemas/request";

// NPM
import { Model } from "mongoose";

@Injectable()
export class RequestRepository {

    constructor (
        @InjectModel(Request.name) private readonly model: Model<Request>
    ) {}
}