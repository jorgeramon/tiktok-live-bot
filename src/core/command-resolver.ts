import { DefaultRequestConfig } from '@/enums/default';
import { Environment } from '@/enums/environment';
import { CommandListenerEvent } from '@/enums/event';
import { EmptyCommentException } from '@/exceptions/empty-comment';
import { UnresolvableAccountException } from '@/exceptions/unresolvable-account';
import { IAccount } from '@/interfaces/account';
import { IChatMessage } from '@/interfaces/messages/chat';
import { CacheService } from '@/services/cache';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CommandResolver {
  private readonly logger: Logger = new Logger(CommandResolver.name);

  constructor(
    private readonly cache_service: CacheService,
    private readonly event_emitter: EventEmitter2,
    private readonly config_service: ConfigService,
  ) {}

  async resolve(message: IChatMessage): Promise<void> {
    const account: IAccount | null =
      await this.cache_service.getAccountByUsername(message.owner_username);

    if (!message.comment) {
      this.logger.verbose(message);
      throw new EmptyCommentException();
    }

    if (!account) {
      throw new UnresolvableAccountException(message.owner_username);
    }

    const bypass_play: boolean = !!this.config_service.get(
      Environment.BYPASS_PLAY,
    );
    const normalized_comment = message.comment.trim().toLowerCase();

    const prefixes = ['!', '.', '+'];

    const command_combinations = prefixes.flatMap((prefix) => [
      `${prefix}${DefaultRequestConfig.PLAY}`,
      `${prefix} ${DefaultRequestConfig.PLAY}`,
    ]);

    const command_used = command_combinations.find((command) =>
      normalized_comment.startsWith(command),
    );

    if (command_used) {
      this.logger.debug(
        `${message.user_nickname} used command ${command_used}`,
      );
    }

    if (bypass_play || command_used) {
      this.event_emitter.emit(CommandListenerEvent.REQUEST_PLAY, {
        account_id: account._id,
        owner_id: message.owner_id,
        owner_username: message.owner_username,
        user_id: message.user_id,
        user_username: message.user_username,
        user_nickname: message.user_nickname,
        user_picture: message.user_picture,
        stream_id: message.stream_id,
        argument: normalized_comment.slice(command_used?.length ?? 0).trim(),
      });
    }
  }
}
