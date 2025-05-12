import { UnresolvableAccountException } from "@exceptions/unresolvable-account";
import { IAccount } from "@interfaces/account";
import { ILive } from "@interfaces/live";
import { Injectable, Logger } from "@nestjs/common";
import { AccountRepository } from "@repositories/account";
import { LiveRepository } from "@repositories/live";

@Injectable()
export class LiveService {

    private readonly logger: Logger = new Logger(LiveService.name);

    constructor(
        private readonly account_repository: AccountRepository,
        private readonly live_repository: LiveRepository
    ) { }

    async setOnlineStatus(username: string, is_online: boolean, stream_id?: string): Promise<void> {
        this.logger.debug(`Setting LIVE status ${is_online ? 'online' : 'offline'} to ${username} - ${stream_id ?? 'NO STREAM ID'}`);

        const account: IAccount | null = await this.account_repository.findOneByUsername(username);

        if (account == null) {
            throw new UnresolvableAccountException(username);
        }

        const live: ILive | null = await this.live_repository.findCurrentOnline(account._id);

        const stream_found = live !== null;
        const no_stream_found = !live;
        const isnt_same_stream = stream_found && live.stream_id !== stream_id;

        if (is_online && isnt_same_stream) {
            this.logger.debug(`Setting ${live.stream_id} LIVE to offline in database...`);
            await this.live_repository.updateStatusById(live._id);

            this.logger.debug(`Creating a new LIVE ${stream_id} for ${username} in database...`);
            await this.live_repository.save({
                stream_id,
                account_id: account._id,
                is_online
            });
        } else if (is_online && no_stream_found) {
            const existing_live: ILive | null = await this.live_repository.findOneByStreamId(stream_id!);

            if (existing_live !== null) {
                this.logger.debug(`Woops... seems like LIVE ${stream_id} from ${username} was offline in database...`);
                await this.live_repository.updateStatusById(existing_live._id, true);
            } else {
                this.logger.debug(`Creating a new LIVE ${stream_id} for ${username} in database...`);

                await this.live_repository.save({
                    stream_id,
                    account_id: account._id,
                    is_online
                });
            }
        } else if (!is_online && stream_found) {
            this.logger.debug(`Setting ${live.stream_id} LIVE to offline in database...`);
            await this.live_repository.updateStatusById(live._id);
        } else {
            this.logger.debug(`There's no need to update LIVE status for ${username}`);
        }
    }
}