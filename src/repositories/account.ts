// NestJS
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { EventEmitter2 } from "@nestjs/event-emitter";

// Schemas
import { Account, AccountDocument } from "@schemas/account";

// Interfaces
import { IAccount } from "@interfaces/account";

// Enums
import { AccountEvent } from "@enums/event";

// NPM
import { Model } from "mongoose";

@Injectable()
export class AccountRepository {

    constructor(
        @InjectModel(Account.name) private readonly model: Model<Account>,
        private readonly event_emitter: EventEmitter2
    ) { }

    async findAll(): Promise<IAccount[]> {
        const documents: AccountDocument[] = await this.model.find();
        return documents.map(document => document.toJSON()) as IAccount[];
    }

    async findOneByNickname(nickname: string): Promise<IAccount | null> {
        const document: AccountDocument | null = await this.model.findOne({ nickname });
        return document !== null ? document.toJSON() as IAccount : null;
    }

    async save(data: Partial<IAccount>): Promise<IAccount> {
        const document: AccountDocument = await new this.model(data).save();
        const instance = document.toJSON() as IAccount;
        this.event_emitter.emit(AccountEvent.CREATED, instance);
        return instance;
    }
}