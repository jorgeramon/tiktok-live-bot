import { IAccount } from "@interfaces/account";
import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { CacheService } from "@services/cache";

@Injectable()
export class SocketGuard implements CanActivate {

    private readonly logger: Logger = new Logger(SocketGuard.name);

    constructor(private readonly cache_service: CacheService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const socket = context.switchToWs().getClient();
        const accounts: IAccount[] | null = await this.cache_service.getAccounts();

        if (!accounts) {
            this.logger.warn('Accounts not loaded in cache');
            return false;
        }

        return accounts.some(account => account._id === socket.handshake.auth.account_id);
    }
}