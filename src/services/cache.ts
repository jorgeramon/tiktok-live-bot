import { AccountEvent } from "@enums/event";
import { IAccount } from "@interfaces/account";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { AccountRepository } from "@repositories/account";
import { CacheUtils } from "@utils/cache-utils";

@Injectable()
export class CacheService implements OnApplicationBootstrap {

    constructor(
        @Inject(CACHE_MANAGER) private readonly cache_manager: Cache,
        private readonly account_repository: AccountRepository,
    ) { }

    async onApplicationBootstrap() {
        await this.loadAccounts();
    }

    @OnEvent(AccountEvent.CREATED)
    async onAccountCreated(account: IAccount): Promise<void> {
        const accounts: IAccount[] = await this.getAccounts();
        await this.cache_manager.set<IAccount[]>(CacheUtils.ACCOUNTS_KEY(), [...accounts, account]);
    }

    async getAccounts(): Promise<IAccount[]> {
        const cache_accounts: IAccount[] | null = await this.cache_manager.get<IAccount[]>(CacheUtils.ACCOUNTS_KEY());
        return cache_accounts ?? [];
    }

    async getAccountByUsername(username: string): Promise<IAccount | null> {
        const cache_accounts: IAccount[] = await this.getAccounts();
        return cache_accounts.find(account => account.username === username) ?? null;
    }

    private async loadAccounts(): Promise<void> {
        const accounts: IAccount[] = await this.account_repository.findAll();
        await this.cache_manager.set<IAccount[]>(CacheUtils.ACCOUNTS_KEY(), accounts);
    }
}