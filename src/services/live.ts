import { SocketListenerEvent } from '@/enums/event';
import { UnresolvableAccountException } from '@/exceptions/unresolvable-account';
import { IAccount } from '@/interfaces/account';
import { ILive } from '@/interfaces/live';
import { IRequest } from '@/interfaces/request';
import { AccountRepository } from '@/repositories/account';
import { LiveRepository } from '@/repositories/live';
import { RequestRepository } from '@/repositories/request';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class LiveService {
  private readonly logger: Logger = new Logger(LiveService.name);

  constructor(
    private readonly account_repository: AccountRepository,
    private readonly live_repository: LiveRepository,
    private readonly request_repository: RequestRepository,
    private readonly event_emitter: EventEmitter2,
  ) {}

  async getOnlineStatus(account_id: string): Promise<boolean> {
    const account: IAccount | null =
      await this.account_repository.findById(account_id);

    if (account == null) {
      throw new UnresolvableAccountException(account_id);
    }

    const live: ILive | null =
      await this.live_repository.findCurrentOnline(account_id);

    return live !== null;
  }

  async setOnlineStatus(
    username: string,
    is_online: boolean,
    stream_id?: string,
  ): Promise<void> {
    this.logger.debug(
      `Setting LIVE status ${is_online ? 'online' : 'offline'} to ${username} - ${stream_id ?? 'NO STREAM ID'}`,
    );

    const account: IAccount | null =
      await this.account_repository.findOneByUsername(username);

    if (account == null) {
      throw new UnresolvableAccountException(username);
    }

    const live: ILive | null = await this.live_repository.findCurrentOnline(
      account._id,
    );

    const stream_found = live !== null;
    const no_stream_found = !live;
    const isnt_same_stream = stream_found && live.stream_id !== stream_id;

    if (is_online && isnt_same_stream) {
      this.logger.debug(
        `Setting ${live.stream_id} LIVE to offline in database...`,
      );
      await this.live_repository.updateStatusById(live._id);

      this.logger.debug(
        `Creating a new LIVE ${stream_id} for ${username} in database...`,
      );

      const current_live: ILive = await this.live_repository.save({
        stream_id,
        account_id: account._id,
        is_online,
      });

      this.event_emitter.emit(SocketListenerEvent.ONLINE_STATUS, {
        is_online,
        account_id: account._id,
        live: current_live,
      });
    } else if (is_online && no_stream_found) {
      const existing_live: ILive | null =
        await this.live_repository.findOneByStreamId(stream_id!);

      if (existing_live !== null) {
        this.logger.debug(
          `Woops... seems like LIVE ${stream_id} from ${username} was offline in database...`,
        );

        await this.live_repository.updateStatusById(existing_live._id, true);

        this.event_emitter.emit(SocketListenerEvent.ONLINE_STATUS, {
          is_online,
          account_id: account._id,
          live: existing_live,
        });
      } else {
        this.logger.debug(
          `Creating a new LIVE ${stream_id} for ${username} in database...`,
        );

        const current_live: ILive = await this.live_repository.save({
          stream_id,
          account_id: account._id,
          is_online,
        });

        this.event_emitter.emit(SocketListenerEvent.ONLINE_STATUS, {
          is_online,
          account_id: account._id,
          live: current_live,
        });
      }
    } else if (!is_online && stream_found) {
      this.logger.debug(
        `Setting ${live.stream_id} LIVE to offline in database...`,
      );

      await this.live_repository.updateStatusById(live._id);

      this.event_emitter.emit(SocketListenerEvent.ONLINE_STATUS, {
        is_online,
        account_id: account._id,
        live: null,
      });
    } else {
      this.logger.debug(
        `There's no need to update LIVE status for ${username}`,
      );
    }
  }

  async findRequestFromCurrentLive(account_id: string): Promise<IRequest[]> {
    const account: IAccount | null =
      await this.account_repository.findById(account_id);

    if (account == null) {
      throw new UnresolvableAccountException(account_id);
    }

    const live: ILive | null =
      await this.live_repository.findCurrentOnline(account_id);

    if (!live) {
      this.logger.debug(
        `${account.username} doesnt have an active LIVE to retrieve requests`,
      );
      return [];
    }

    return this.request_repository.findByLiveId(live._id);
  }

  async completeRequest(
    account_id: string,
    request_id: string,
  ): Promise<IRequest> {
    const account: IAccount | null =
      await this.account_repository.findById(account_id);

    if (account == null) {
      throw new UnresolvableAccountException(account_id);
    }

    const live: ILive | null =
      await this.live_repository.findCurrentOnline(account_id);

    if (!live) {
      this.logger.debug(
        `${account.username} doesnt have an active LIVE to send messages`,
      );
      throw new Error();
    }

    const request: IRequest | null = await this.request_repository.update(
      request_id,
      { completed: true, completed_at: new Date() },
    );

    if (!request) {
      throw new Error();
    }

    this.event_emitter.emit(SocketListenerEvent.REQUEST_UPDATED, {
      account_id,
      request,
    });

    return request;
  }
}
