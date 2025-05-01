// NestJS
import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

// Interfaces
import { IChatMessage } from "@interfaces/chat-message";
import { IAccount } from "@interfaces/account";

// Services
import { CacheService } from "@services/cache";

// Exceptions
import { UnresolvableAccountException } from "@exceptions/unresolvable-account";

// Enums
import { DefaultRequestFeature } from "@enums/default";
import { RequestFeatureEvent } from "@enums/event";

@Injectable()
export class CommandResolver {

    private readonly logger: Logger = new Logger(CommandResolver.name);

    constructor (
        private readonly cache_service: CacheService,
        private readonly event_emitter: EventEmitter2
    ) {}

    async resolve(event: IChatMessage): Promise<void> {
        const account: IAccount | null = await this.cache_service.getAccountByNickname(event.owner_nickname);

        if (!account) {
            throw new UnresolvableAccountException();
        }
        const command = `${DefaultRequestFeature.PREFIX}${DefaultRequestFeature.PLAY}`;
        const normalized_comment = event.comment.toLowerCase();

        if (normalized_comment.startsWith(command)) {
            this.event_emitter.emit(RequestFeatureEvent.PLAY, {
                account_id: account._id,
                user_id: event.owner_id,
                user_nickname: event.owner_nickname,
                stream_id: event.stream_id,
                arguments: normalized_comment.replace(command, '').trim()
            });
        }
    }
}