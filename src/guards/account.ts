import { IAccount } from '@/interfaces/account';
import { IMessage } from '@/interfaces/messages/message';
import { CacheService } from '@/services/cache';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';

@Injectable()
export class AccountGuard implements CanActivate {
  private readonly logger: Logger = new Logger(AccountGuard.name);

  constructor(private readonly cache_service: CacheService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const message = context.switchToRpc().getData<IMessage>();

    const accounts: IAccount[] | null = await this.cache_service.getAccounts();

    if (!accounts) {
      this.logger.warn('Accounts not loaded in cache');
      return false;
    }

    return accounts.some(
      (account) => account.username === message.owner_username,
    );
  }
}
