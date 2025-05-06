// NestJS
import { Inject, Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { TiktokEvent } from "@enums/event";

// Interfaces
import { IOnlineMessage } from "@interfaces/online-message";
import { ILive } from "@interfaces/live";
import { IAccount } from "@interfaces/account";
import { IEndMessage } from "@interfaces/end-message";

// Repositories
import { LiveRepository } from "@repositories/live";
import { AccountRepository } from "@repositories/account";

// NPM
import { lastValueFrom } from "rxjs";

@Injectable()
export class LiveService implements OnApplicationBootstrap {

    private readonly logger: Logger = new Logger(LiveService.name);

    constructor(
        @Inject('MESSAGE_BROKER') private readonly client: ClientProxy,
        private readonly live_repository: LiveRepository,
        private readonly account_repository: AccountRepository
    ) { }

    async onApplicationBootstrap(): Promise<void> {
        try {
            this.logger.debug('Getting accounts live status');

            const accounts: IAccount[] = await this.account_repository.findAll();

            for (const account of accounts) {
                const status = await lastValueFrom(this.client.send<IOnlineMessage | null>(TiktokEvent.IS_ONLINE, account.nickname));

                if (status !== null) {
                    this.logger.debug(`Account ${status.owner_nickname} is online`);
                    await this.setOnlineStatus(status);
                }
            }
        } catch (err) {
            this.logger.error(`Unexpected error ocurred on service boostrap: ${err.message}`);
        }
    }

    async setOnlineStatus(event: IOnlineMessage): Promise<void> {
        const live: ILive | null = await this.live_repository.findOneByStreamId(event.stream_id);

        if (live !== null) {
            this.logger.debug(`Live ${live.stream_id} is already associated to ${event.owner_nickname}`);
            return;
        }

        this.logger.debug(`Associating live ${event.stream_id} to ${event.owner_nickname} - ${event.owner_id}`);
        const account: IAccount | null = await this.account_repository.findOneByNickname(event.owner_nickname);

        if (account === null) {
            this.logger.error(`Account ${event.owner_nickname} not found, this shouldn't be possible`);
            return;
        }

        await this.live_repository.updateStatusByAccountId(account._id);
        await this.live_repository.save({ account_id: account._id, stream_id: event.stream_id, is_online: true });
    }

    async setOfflineStatus(event: IEndMessage): Promise<void> {
        const current_live: ILive | null = await this.live_repository.findOneByStreamId(event.stream_id);

        if (current_live !== null) {
            this.logger.debug(`Live ${event.stream_id} from ${event.owner_nickname} will be set offline`);
            await this.live_repository.updateStatusById(current_live._id);
        }
    }
}