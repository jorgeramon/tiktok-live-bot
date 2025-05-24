import { IAccount } from '@/interfaces/account';
import { CacheService } from '@/services/cache';
import { Logger } from '@nestjs/common';

export class AccountGuard {
  private readonly logger: Logger = new Logger(AccountGuard.name);

  constructor(private readonly cache_service: CacheService) {}

  async isValid(username: string): Promise<boolean> {
    const accounts: IAccount[] | null = await this.cache_service.getAccounts();

    if (!accounts) {
      this.logger.warn('Accounts not loaded in cache');
      return false;
    }

    return accounts.some((account) => account.username === username);
  }
}
