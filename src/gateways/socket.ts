// NestJS
import { Logger } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";

// NPM
import { Socket } from 'socket.io';

// Enum
import { ErrorCode, SocketAcknowlegment, SocketRequestEvent, SocketResponseEvent } from "@enums/event";

// Interfaces
import { IRequest } from "@interfaces/request";
import { ILive } from "@interfaces/live";

// Repositories
import { RequestRepository } from "@repositories/request";
import { LiveRepository } from "@repositories/live";

@WebSocketGateway(2222, {
    cors: {
        origin: '*'
    }
})
export class SocketGateway {

    private readonly logger: Logger = new Logger(SocketGateway.name);

    constructor (
        private readonly request_repository: RequestRepository,
        private readonly live_repository: LiveRepository
    ) {}

    @SubscribeMessage(SocketRequestEvent.GET_STATUS)
    async onQueryStatus(
        @ConnectedSocket() client: Socket,
        @MessageBody('account_id') account_id
    ): Promise<SocketAcknowlegment> {
        const event_key: string = SocketResponseEvent.STATUS.replace('{account_id}', account_id);

        const live: ILive | null = await this.live_repository.findCurrentOnline(account_id);
                
        client.emit(event_key, {
            ok: true,
            data: live
        });

        return SocketAcknowlegment.OK;
    }

    @SubscribeMessage(SocketRequestEvent.GET_REQUESTS)
    async onQueryRequests(
        @ConnectedSocket() client: Socket,
        @MessageBody('account_id') account_id: string
    ): Promise<SocketAcknowlegment> {
        const event_key: string = SocketResponseEvent.REQUESTS.replace('{account_id}', account_id);

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