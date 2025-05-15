import { IAccount } from '@/interfaces/account';
import { AccountRepository } from '@/repositories/account';
import { CacheUtils } from '@/utils/cache-utils';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class CacheService implements OnApplicationBootstrap {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache_manager: Cache,
    private readonly account_repository: AccountRepository,
  ) {}

  async onApplicationBootstrap() {
    await this.loadAccounts();
  }

  async getAccounts(): Promise<IAccount[]> {
    const cache_accounts: IAccount[] | null = await this.cache_manager.get<
      IAccount[]
    >(CacheUtils.ACCOUNTS_KEY());
    return cache_accounts ?? [];
  }

  async getAccountByUsername(username: string): Promise<IAccount | null> {
    const cache_accounts: IAccount[] = await this.getAccounts();
    return (
      cache_accounts.find((account) => account.username === username) ?? null
    );
  }

  async getSocketIdsByAccountId(account_id: string): Promise<string[]> {
    return (
      (await this.cache_manager.get<string[]>(
        CacheUtils.SOCKET_KEY(account_id),
      )) ?? []
    );
  }

  private async loadAccounts(): Promise<void> {
    const accounts: IAccount[] = await this.account_repository.findAll();
    await this.cache_manager.set<IAccount[]>(
      CacheUtils.ACCOUNTS_KEY(),
      accounts,
    );
  }
}
