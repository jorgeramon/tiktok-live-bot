import { DefaultRequestConfig } from "@enums/default";
import { CommandListenerEvent, SocketListenerEvent } from "@enums/event";
import { AccountOfflineException } from "@exceptions/account-offline";
import { EmptyCommandArgumentException } from "@exceptions/empty-command-argument";
import { MaximumRequestsReachedException } from "@exceptions/maximum-requests-reached";
import { UnresolvableLiveException } from "@exceptions/unresolvable-live";
import { ICommandEvent } from "@interfaces/command-event";
import { ILive } from "@interfaces/live";
import { IRequest } from "@interfaces/request";
import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { LiveRepository } from "@repositories/live";
import { RequestRepository } from "@repositories/request";
import { logException } from "@utils/log-exception";

@Injectable()
export class CommandListener {

    private readonly logger: Logger = new Logger(CommandListener.name);

    constructor(
        private readonly request_repository: RequestRepository,
        private readonly live_repository: LiveRepository,
        private readonly event_emitter: EventEmitter2
    ) { }

    @OnEvent(CommandListenerEvent.REQUEST_PLAY)
    async onPlay(event: ICommandEvent): Promise<void> {
        try {
            this.logger.verbose(event);

            const argument = event.argument.trim();

            if (!argument) {
                this.logger.verbose(`No Argument: ${argument}`);
                throw new EmptyCommandArgumentException(event.owner_username, event.stream_id, event.user_username);
            }

            const live: ILive | null = await this.live_repository.findOneByStreamId(event.stream_id);

            if (!live) {
                throw new UnresolvableLiveException(event.owner_username, event.stream_id);
            }

            if (!live.is_online) {
                throw new AccountOfflineException(event.owner_username, event.stream_id);
            }

            const current_requests: IRequest[] = await this.request_repository.findByLiveIdAndUserId(live._id, event.user_id);

            if (current_requests.length === DefaultRequestConfig.MAXIMUM_PER_ACCOUNT) {
                throw new MaximumRequestsReachedException(event.owner_username, event.stream_id, event.user_username);
            }

            const request: IRequest = await this.request_repository.save({
                live_id: live._id,
                user_id: event.user_id,
                user_username: event.user_username,
                user_nickname: event.user_nickname,
                user_picture: event.user_picture,
                request: event.argument
            });

            this.logger.verbose(`Sending request to socket: ${request.request}`);

            this.event_emitter.emit(SocketListenerEvent.REQUEST_CREATED, {
                account_id: event.account_id,
                request
            });
        } catch (err) {
            logException(this.logger, err);
        }
    }
}