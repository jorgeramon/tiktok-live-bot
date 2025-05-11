// NestJS
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

// Schemas
import { Account, AccountDocument } from "@schemas/account";

// Interfaces
import { IAccount } from "@interfaces/account";

// NPM
import { Model } from "mongoose";

@Injectable()
export class AccountRepository {

    constructor(
        @InjectModel(Account.name) private readonly model: Model<Account>,
    ) { }

    async findAll(): Promise<IAccount[]> {
        const documents: AccountDocument[] = await this.model.find();
        return documents.map(document => document.toJSON()) as IAccount[];
    }

    async findOneByUsername(username: string): Promise<IAccount | null> {
        const document: AccountDocument | null = await this.model.findOne({ username });
        return document !== null ? document.toJSON() as IAccount : null;
    }

    async save(data: Partial<IAccount>): Promise<IAccount> {
        const document: AccountDocument = await new this.model(data).save();
        return document.toJSON() as IAccount;
    }
}