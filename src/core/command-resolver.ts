import { DefaultRequestConfig } from "@enums/default";
import { CommandListenerEvent } from "@enums/event";
import { EmptyCommentException } from "@exceptions/empty-comment";
import { UnresolvableAccountException } from "@exceptions/unresolvable-account";
import { IAccount } from "@interfaces/account";
import { IChatMessage } from "@interfaces/chat-message";
import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CacheService } from "@services/cache";

@Injectable()
export class CommandResolver {

    constructor(
        private readonly cache_service: CacheService,
        private readonly event_emitter: EventEmitter2
    ) { }

    async resolve(message: IChatMessage): Promise<void> {
        const account: IAccount | null = await this.cache_service.getAccountByUsername(message.owner_username);

        if (!message.comment) {
            throw new EmptyCommentException();
        }

        if (!account) {
            throw new UnresolvableAccountException(message.owner_username);
        }

        const command = `${DefaultRequestConfig.PREFIX}${DefaultRequestConfig.PLAY}`;
        const normalized_comment = message.comment.trim().toLowerCase();

        if (normalized_comment.startsWith(command)) {
            this.event_emitter.emit(CommandListenerEvent.REQUEST_PLAY, {
                account_id: account._id,
                owner_id: message.owner_id,
                owner_username: message.owner_username,
                user_id: message.user_id,
                user_username: message.user_username,
                user_nickname: message.user_nickname,
                user_picture: message.user_picture,
                stream_id: message.stream_id,
                argument: normalized_comment.replace(command, '').trim()
            });
        }
    }
}