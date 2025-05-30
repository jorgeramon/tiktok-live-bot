import { IAccount } from '@/interfaces/account';
import { Account, AccountDocument } from '@/schemas/account';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AccountRepository {
  constructor(
    @InjectModel(Account.name) private readonly model: Model<Account>,
  ) {}

  async findAll(): Promise<IAccount[]> {
    const documents: AccountDocument[] = await this.model.find();
    return documents.map((document) => document.toJSON()) as IAccount[];
  }

  async findOneByUsername(username: string): Promise<IAccount | null> {
    const document: AccountDocument | null = await this.model.findOne({
      username,
    });
    return document !== null ? (document.toJSON() as IAccount) : null;
  }

  async findById(_id: string): Promise<IAccount | null> {
    const document: AccountDocument | null = await this.model.findById(_id);
    return document !== null ? (document.toJSON() as IAccount) : null;
  }

  async save(data: Partial<IAccount>): Promise<IAccount> {
    const document: AccountDocument = await new this.model(data).save();
    return document.toJSON() as IAccount;
  }
}
