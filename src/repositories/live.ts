// NestJS
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

// Schemas
import { Live } from "@schemas/live";

// NPM
import { Model } from "mongoose";

@Injectable()
export class LiveRepository {

    constructor (
        @InjectModel(Live.name) private readonly model: Model<Live>
    ) {}
}