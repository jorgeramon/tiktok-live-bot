// NestJS
import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";

// Interfaces
import { IAccount } from "@interfaces/account";
import { IUserMessage } from "@interfaces/user-message";

// Services
import { CacheService } from "@services/cache";

export class AccountGuard implements CanActivate {

    private readonly logger: Logger = new Logger(AccountGuard.name);

    constructor (private readonly cache_service: CacheService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const message = context.switchToRpc().getData<IUserMessage>();
        const accounts: IAccount[] | null = await this.cache_service.getAccounts();

        if (!accounts) {
            this.logger.warn('Accounts not loaded in cache');
            return false;
        }

        return accounts.some(account => account.nickname === message.owner_nickname);
    }
}