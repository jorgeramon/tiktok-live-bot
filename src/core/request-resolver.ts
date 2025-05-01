// NestJS
import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";

// Interfaces
import { ICommandEvent } from "@interfaces/command-event";
import { ILive } from "@interfaces/live";
import { IRequest } from "@interfaces/request";

// Repositories
import { RequestRepository } from "@repositories/request";
import { LiveRepository } from "@repositories/live";

// Enums
import { RequestCommandEvent, RequestEvent } from "@enums/event";
import { DefaultRequestConfig } from "@enums/default";

// Exceptions
import { AccountOfflineException } from "@exceptions/account-offline";
import { UnresolvableLiveException } from "@exceptions/unresolvable-live";
import { MaximumRequestsReachedException } from "@exceptions/maximum-requests-reached";
import { EmptyCommandArgumentException } from "@exceptions/empty-command-argument";

@Injectable()
export class RequestResolver {

    private readonly logger: Logger = new Logger(RequestResolver.name);

    constructor(
        private readonly request_repository: RequestRepository,
        private readonly live_repository: LiveRepository,
        private readonly event_emitter: EventEmitter2
    ) { }

    @OnEvent(RequestCommandEvent.PLAY)
    async onPlay(event: ICommandEvent): Promise<void> {
        try {
            const argument = event.argument.trim();

            if (!argument) {
                throw new EmptyCommandArgumentException();
            }

            const live: ILive | null = await this.live_repository.findOneByStreamId(event.stream_id);

            if (!live) {
                throw new UnresolvableLiveException();
            }

            if (!live.is_online) {
                throw new AccountOfflineException();
            }

            const current_requests: IRequest[] = await this.request_repository.findByLiveIdAndUserId(live._id, event.user_id);

            if (current_requests.length === DefaultRequestConfig.MAXIMUM_PER_ACCOUNT) {
                throw new MaximumRequestsReachedException();
            }

            const request: IRequest = await this.request_repository.save({
                live_id: live._id,
                user_id: event.user_id,
                user_nickname: event.user_nickname,
                user_picture: event.user_picture,
                request: event.argument
            });

            this.event_emitter.emit(RequestEvent.CREATED, {
                account_id: event.account_id,
                request
            });
        } catch (err) {
            if (err instanceof EmptyCommandArgumentException) {
                this.logger.warn(`Live ${event.stream_id} ignored request due to being empty`);
            } else if (err instanceof UnresolvableLiveException) {
                this.logger.error(`Live ${event.stream_id} is not registered in database`);
            } else if (err instanceof AccountOfflineException) {
                this.logger.error(`Live ${event.stream_id} is offline`);
            } else {
                this.logger.error(`Unexpected error while processing a request: ${err.message}`);
            }
        }
    }
}