// NestJS
import { Injectable, Logger } from "@nestjs/common";

// Interfaces
import { IOnlineMessage } from "@interfaces/online-message";
import { ILive } from "@interfaces/live";
import { IAccount } from "@interfaces/account";
import { IEndMessage } from "@interfaces/end-message";

// Repositories
import { LiveRepository } from "@repositories/live";
import { AccountRepository } from "@repositories/account";

@Injectable()
export class LiveService {

    private readonly logger: Logger = new Logger(LiveService.name);

    constructor(
        private readonly live_repository: LiveRepository,
        private readonly account_repository: AccountRepository
    ) { }

    async setOnlineStatus(event: IOnlineMessage): Promise<void> {
        const current_live: ILive | null = await this.live_repository.findOneByStreamId(event.stream_id);

        if (current_live !== null) {
            this.logger.log(`Live is already associated to ${event.owner_nickname}`);
            return;
        }

        this.logger.log(`Associating live ${event.stream_id} to ${event.owner_nickname} - ${event.owner_id}`);
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
            this.logger.log(`Live ${event.stream_id} from ${event.owner_nickname} will be set offline`);
            await this.live_repository.updateStatusById(current_live._id);
        }
    }
}