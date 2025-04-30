// NestJS
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

// Schemas
import { Feature, FeatureDocument } from "@schemas/feature";

// Interfaces
import { IFeature } from "@interfaces/feature";

// NPM
import { Model } from "mongoose";

@Injectable()
export class FeatureRepository {

    constructor(
        @InjectModel(Feature.name) private readonly model: Model<Feature>
    ) { }

    async findAll(): Promise<IFeature[]> {
        const documents: FeatureDocument[] = await this.model.find();
        return documents.map(document => document.toJSON()) as IFeature[];
    }

    async save(data: Partial<IFeature>): Promise<IFeature> {
        const document: FeatureDocument = await new this.model(data).save();
        return document.toJSON() as IFeature;
    }
}