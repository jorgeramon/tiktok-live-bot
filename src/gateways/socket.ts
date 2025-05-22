import {
  SocketAcknowlegment,
  SocketEvent,
  SocketInputEvent,
  SocketListenerEvent,
  SocketOutputEvent,
} from '@/enums/event';
import { SocketGuard } from '@/guards/socket';
import { IOnlineStatusEvent } from '@/interfaces/events/online-status';
import {
  IRequestCreatedEvent,
  IRequestUpdatedEvent,
} from '@/interfaces/events/request';
import { ISocketEvent, ISocketEventResponse } from '@/interfaces/events/socket';
import { CacheService } from '@/services/cache';
import { SocketEventService } from '@/services/socket-event';
import { logException } from '@/utils/log-exception';
import { Logger, UseGuards } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { RemoteSocket, Server, Socket } from 'socket.io';

@UseGuards(SocketGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger: Logger = new Logger(SocketGateway.name);

  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly socket_event_service: SocketEventService,
    private readonly event_emitter: EventEmitter2,
    private readonly cache_service: CacheService,
  ) {}

  handleConnection(client: Socket): void {
    this.logger.verbose(
      `Connected socket: ${client.id} - ${client.handshake.auth.account_id}`,
    );

    this.event_emitter.emit(SocketEvent.CONNECTED, {
      socket_id: client.id,
      account_id: client.handshake.auth.account_id,
    });
  }

  handleDisconnect(client: Socket): void {
    this.logger.verbose(
      `Disconnected socket: ${client.id} - ${client.handshake.auth.account_id}`,
    );
    this.event_emitter.emit(SocketEvent.DISCONNECTED, {
      socket_id: client.id,
      account_id: client.handshake.auth.account_id,
    });
  }

  @OnEvent(SocketListenerEvent.REQUEST_CREATED)
  async onRequestCreated(event: IRequestCreatedEvent): Promise<void> {
    try {
      const event_key: string = SocketOutputEvent.REQUEST_CREATED.replace(
        '{account_id}',
        event.account_id,
      );

      this.broadcast(event.account_id, event_key, {
        ok: true,
        data: event.request,
      });
    } catch (err) {
      logException(this.logger, err);
    }
  }

  @OnEvent(SocketListenerEvent.REQUEST_UPDATED)
  async onRequestUpdate(event: IRequestUpdatedEvent): Promise<void> {
    try {
      const event_key: string = SocketOutputEvent.REQUEST_UPDATED.replace(
        '{account_id}',
        event.account_id,
      );

      this.broadcast(event.account_id, event_key, {
        ok: true,
        data: event.request,
      });
    } catch (err) {
      logException(this.logger, err);
    }
  }

  @OnEvent(SocketListenerEvent.ONLINE_STATUS)
  async onStatus(event: IOnlineStatusEvent) {
    try {
      const event_key: string = SocketOutputEvent.GET_STATUS.replace(
        '{account_id}',
        event.account_id,
      );

      this.broadcast(event.account_id, event_key, {
        ok: true,
        data: event.is_online,
      });
    } catch (err) {
      logException(this.logger, err);
    }
  }

  @SubscribeMessage(SocketInputEvent.COMPLETE_REQUEST)
  async onCompleteRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody('request_id') request_id: string,
  ): Promise<SocketAcknowlegment> {
    const { account_id } = client.handshake.auth;
    const event_key: string = SocketOutputEvent.REQUEST_COMPLETED.replace(
      '{account_id}',
      account_id,
    );

    const response: ISocketEventResponse =
      await this.socket_event_service.completeRequest(account_id, request_id);

    this.broadcast(account_id, event_key, response.body);

    return response.acknowlegment;
  }

  private async getSockets(
    account_id: string,
  ): Promise<RemoteSocket<any, any>[]> {
    const socket_ids: string[] =
      await this.cache_service.getSocketIdsByAccountId(account_id);

    if (!socket_ids.length) {
      return [];
    }

    const sockets: RemoteSocket<any, any>[] = await this.server.fetchSockets();

    return sockets.filter(({ id }) => socket_ids.includes(id));
  }

  private async broadcast(
    account_id: string,
    event_key: string,
    message: ISocketEvent,
  ) {
    const sockets: RemoteSocket<any, any>[] = await this.getSockets(account_id);

    for (const socket of sockets) {
      this.logger.verbose(`Emitting event: ${socket.id} - ${event_key}`);
      socket.emit(event_key, message);
    }
  }
}
