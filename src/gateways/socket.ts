import { ErrorCode, SocketAcknowlegment, SocketEvent, SocketInputEvent, SocketListenerEvent, SocketOutputEvent } from "@enums/event";
import { UnresolvableSocketException } from "@exceptions/unresolvable-socket";
import { SocketGuard } from "@guards/socket";
import { ILive } from "@interfaces/live";
import { IRequest } from "@interfaces/request";
import { IRequestEvent } from "@interfaces/request-event";
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

    handleConnection(socket: Socket): void {
        this.event_emitter.emit(SocketEvent.CONNECTED, {
            socket_id: socket.id,
            account_id: socket.handshake.auth.account_id
        });
    }

    handleDisconnect(socket: Socket): void {
        this.event_emitter.emit(SocketEvent.DISCONNECTED, {
            socket_id: socket.id,
            account_id: socket.handshake.auth.account_id
        });
    }

    @OnEvent(SocketListenerEvent.REQUEST_CREATED)
    async onRequest(event: IRequestEvent): Promise<void> {
        try {
            const socket_id: string | null = await this.cache_service.getSocketIdByAccountId(event.account_id);

            if (!socket_id) {
                throw new UnresolvableSocketException(event.account_id);
            }

            const sockets: RemoteSocket<any, any>[] = await this.server.fetchSockets()
            const socket: RemoteSocket<any, any> | undefined = sockets.find(s => s.id === socket_id);

            if (!socket) {
                throw new UnresolvableSocketException(event.account_id);
            }

            const event_key: string = SocketOutputEvent.REQUEST_CREATED.replace('{account_id}', event.account_id);

            socket.emit(event_key, event.request);
        } catch (err) {
            logException(this.logger, err);
        }
    }

    @SubscribeMessage(SocketInputEvent.GET_STATUS)
    async onQueryStatus(
        @ConnectedSocket() client: Socket,
        @MessageBody('account_id') account_id
    ): Promise<SocketAcknowlegment> {
        this.logger.verbose(`${SocketInputEvent.GET_STATUS}: ${account_id}`);

        const event_key: string = SocketOutputEvent.GET_STATUS.replace('{account_id}', account_id);

        const live: ILive | null = await this.live_repository.findCurrentOnline(account_id);

        client.emit(event_key, {
            ok: true,
            data: live
        });

        return SocketAcknowlegment.OK;
    }

    @SubscribeMessage(SocketInputEvent.GET_REQUESTS)
    async onQueryRequests(
        @ConnectedSocket() client: Socket,
        @MessageBody('account_id') account_id: string
    ): Promise<SocketAcknowlegment> {
        const event_key: string = SocketOutputEvent.GET_REQUESTS.replace('{account_id}', account_id);

        this.logger.verbose(`${SocketInputEvent.GET_REQUESTS}: ${account_id} => ${event_key}`);

        const live: ILive | null = await this.live_repository.findCurrentOnline(account_id);

        if (!live) {
            client.emit(event_key, {
                error: true,
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
}