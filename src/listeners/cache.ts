import { DatabaseEvent, SocketEvent } from '@/enums/event';
import { IAccount } from '@/interfaces/account';
import { IConnectedSocketEvent } from '@/interfaces/events/connected-socket';
import { IDisconnectedSocketEvent } from '@/interfaces/events/disconnected-socket';
import { CacheUtils } from '@/utils/cache-utils';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class CacheListener {
  constructor(@Inject(CACHE_MANAGER) private readonly cache_manager: Cache) {}

  @OnEvent(DatabaseEvent.ACCOUNT_CREATED)
  async onAccountCreated(account: IAccount): Promise<void> {
    const cache_accounts: IAccount[] | null = await this.cache_manager.get<
      IAccount[]
    >(CacheUtils.ACCOUNTS_KEY());
    await this.cache_manager.set<IAccount[]>(CacheUtils.ACCOUNTS_KEY(), [
      ...(cache_accounts ?? []),
      account,
    ]);
  }

  @OnEvent(SocketEvent.CONNECTED)
  async onSocketConnected(event: IConnectedSocketEvent): Promise<void> {
    const socket_ids: string[] =
      (await this.cache_manager.get<string[]>(
        CacheUtils.SOCKET_KEY(event.account_id),
      )) ?? [];

    await this.cache_manager.set<string[]>(
      CacheUtils.SOCKET_KEY(event.account_id),
      [...new Set([...socket_ids, event.socket_id])],
    );
  }

  @OnEvent(SocketEvent.DISCONNECTED)
  async onSocketDisconnected(event: IDisconnectedSocketEvent): Promise<void> {
    const socket_ids: string[] =
      (await this.cache_manager.get<string[]>(
        CacheUtils.SOCKET_KEY(event.account_id),
      )) ?? [];

    await this.cache_manager.set<string[]>(
      CacheUtils.SOCKET_KEY(event.account_id),
      socket_ids.filter((socket_id) => socket_id !== event.socket_id),
    );
  }
}
