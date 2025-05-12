import { DatabaseEvent, SocketEvent } from "@enums/event";
import { IAccount } from "@interfaces/account";
import { IConnectedSocketEvent } from "@interfaces/connected-socket-event";
import { IDisconnectedSocketEvent } from "@interfaces/disconnected-socket-event";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { CacheUtils } from "@utils/cache-utils";

@Injectable()
export class CacheListener {

    private readonly logger: Logger = new Logger(CacheListener.name);

    constructor(
        @Inject(CACHE_MANAGER) private readonly cache_manager: Cache,
    ) { }


    @OnEvent(DatabaseEvent.ACCOUNT_CREATED)
    async onAccountCreated(account: IAccount): Promise<void> {
        const cache_accounts: IAccount[] | null = await this.cache_manager.get<IAccount[]>(CacheUtils.ACCOUNTS_KEY());
        await this.cache_manager.set<IAccount[]>(CacheUtils.ACCOUNTS_KEY(), [...(cache_accounts ?? []), account]);
        this.logger.debug(`Cache account: ${account._id} - ${account.username}`);
    }

    @OnEvent(SocketEvent.CONNECTED)
    async onSocketConnected(event: IConnectedSocketEvent): Promise<void> {
        await this.cache_manager.set<string>(CacheUtils.SOCKET_KEY(event.account_id), event.socket_id);
        this.logger.debug(`Cache socket: ${event.account_id} => ${event.socket_id}`);
    }

    @OnEvent(SocketEvent.DISCONNECTED)
    async onSocketDisconnected(event: IDisconnectedSocketEvent): Promise<void> {
        await this.cache_manager.del(CacheUtils.SOCKET_KEY(event.account_id));
        this.logger.debug(`Deleted cache socket: ${event.socket_id}`);
    }
}