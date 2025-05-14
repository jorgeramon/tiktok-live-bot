import { ErrorCode, SocketAcknowlegment, SocketEvent, SocketInputEvent, SocketListenerEvent, SocketOutputEvent } from "@enums/event";
import { UnresolvableSocketException } from "@exceptions/unresolvable-socket";
import { SocketGuard } from "@guards/socket";
import { IOnlineStatusEvent } from "@interfaces/events/online-status";
import { IRequestCreatedEvent, IRequestUpdatedEvent } from "@interfaces/events/request";
import { ILive } from "@interfaces/live";
import { IRequest } from "@interfaces/request";
import { Logger, UseGuards } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { LiveRepository } from "@repositories/live";
import { RequestRepository } from "@repositories/request";
import { CacheService } from "@services/cache";
import { logException } from "@utils/log-exception";
import { RemoteSocket, Server, Socket } from 'socket.io';

@UseGuards(SocketGuard)
@WebSocketGateway(2222, {
    cors: {
        origin: '*'
    }
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

    private readonly logger: Logger = new Logger(SocketGateway.name);

    @WebSocketServer()
    private readonly server: Server;

    constructor(
        private readonly request_repository: RequestRepository,
        private readonly live_repository: LiveRepository,
        private readonly event_emitter: EventEmitter2,
        private readonly cache_service: CacheService
    ) { }

    handleConnection(client: Socket): void {
        this.event_emitter.emit(SocketEvent.CONNECTED, {
            socket_id: client.id,
            account_id: client.handshake.auth.account_id
        });
    }

    handleDisconnect(client: Socket): void {
        this.event_emitter.emit(SocketEvent.DISCONNECTED, {
            socket_id: client.id,
            account_id: client.handshake.auth.account_id
        });
    }

    @OnEvent(SocketListenerEvent.REQUEST_CREATED)
    async onRequestCreated(event: IRequestCreatedEvent): Promise<void> {
        try {
            const client: RemoteSocket<any, any> = await this.getSocket(event.account_id);
            const event_key: string = SocketOutputEvent.REQUEST_CREATED.replace('{account_id}', event.account_id);
            client.emit(event_key, {
                ok: true,
                data: event.request
            });
        } catch (err) {
            logException(this.logger, err);
        }
    }

    @OnEvent(SocketListenerEvent.REQUEST_UPDATED)
    async onRequestUpdate(event: IRequestUpdatedEvent): Promise<void> {
        try {
            const client: RemoteSocket<any, any> = await this.getSocket(event.account_id);
            const event_key: string = SocketOutputEvent.REQUEST_UPDATED.replace('{account_id}', event.account_id);
            client.emit(event_key, {
                ok: true,
                data: {
                    request_id: event.request_id,
                    new_request: event.new_request
                }
            });
        } catch (err) {
            logException(this.logger, err);
        }
    }

    @OnEvent(SocketListenerEvent.ONLINE_STATUS)
    async onStatus(event: IOnlineStatusEvent) {
        try {
            const client: RemoteSocket<any, any> = await this.getSocket(event.account_id);
            const event_key: string = SocketOutputEvent.GET_STATUS.replace('{account_id}', event.account_id);
            client.emit(event_key, {
                ok: true,
                data: {
                    is_online: event.is_online,
                    live: event.live
                }
            });
        } catch (err) {
            logException(this.logger, err);
        }
    }

    @SubscribeMessage(SocketInputEvent.GET_STATUS)
    async onQueryStatus(
        @ConnectedSocket() client: Socket
    ): Promise<SocketAcknowlegment> {
        const { account_id } = client.handshake.auth;
        const event_key: string = SocketOutputEvent.GET_STATUS.replace('{account_id}', account_id);

        this.logger.verbose(`${SocketInputEvent.GET_STATUS} (${event_key})`);

        const live: ILive | null = await this.live_repository.findCurrentOnline(account_id);

        client.emit(event_key, {
            ok: true,
            data: {
                is_online: live !== null,
                live
            }
        });

        return SocketAcknowlegment.OK;
    }

    @SubscribeMessage(SocketInputEvent.GET_REQUESTS)
    async onQueryRequests(
        @ConnectedSocket() client: Socket
    ): Promise<SocketAcknowlegment> {
        const { account_id } = client.handshake.auth;
        const event_key: string = SocketOutputEvent.GET_REQUESTS.replace('{account_id}', account_id);

        this.logger.verbose(`${SocketInputEvent.GET_REQUESTS} (${event_key})`);

        const live: ILive | null = await this.live_repository.findCurrentOnline(account_id);

        if (!live) {
            client.emit(event_key, {
                ok: false,
                code: ErrorCode.USER_OFFLINE
            });

            return SocketAcknowlegment.ERROR;
        }

        const requests: IRequest[] = await this.request_repository.findByLiveId(live._id);

        client.emit(event_key, {
            ok: true,
            data: requests
        });

        return SocketAcknowlegment.OK;
    }

    @SubscribeMessage(SocketInputEvent.COMPLETE_REQUEST)
    async onCompleteRequest(
        @ConnectedSocket() client: Socket,
        @MessageBody('request_id') request_id: string
    ): Promise<SocketAcknowlegment> {
        const { account_id } = client.handshake.auth;
        const event_key: string = SocketOutputEvent.REQUEST_COMPLETED.replace('{account_id}', account_id);

        this.logger.verbose(`${SocketInputEvent.COMPLETE_REQUEST} (${account_id} - ${request_id})`);

        const live: ILive | null = await this.live_repository.findCurrentOnline(account_id);

        if (!live) {
            client.emit(event_key, {
                error: true,
                code: ErrorCode.USER_OFFLINE
            });

            return SocketAcknowlegment.ERROR;
        }

        await this.request_repository.update(request_id, { completed: true });

        client.emit(event_key, {
            ok: true,
            data: request_id
        });

        return SocketAcknowlegment.OK;
    }

    private async getSocket(account_id: string): Promise<RemoteSocket<any, any>> {
        const socket_id: string | null = await this.cache_service.getSocketIdByAccountId(account_id);

        if (!socket_id) {
            throw new UnresolvableSocketException(account_id);
        }

        const sockets: RemoteSocket<any, any>[] = await this.server.fetchSockets()
        const socket: RemoteSocket<any, any> | undefined = sockets.find(s => s.id === socket_id);

        if (!socket) {
            throw new UnresolvableSocketException(account_id);
        }

        return socket;
    }
}