import { Environment, Microservice } from '@/enums/environment';
import { RcpOutputEvent, SocketListenerEvent } from '@/enums/event';
import {
  IRequestCreatedEvent,
  IRequestUpdatedEvent,
} from '@/interfaces/events/request';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class NotificationGateway {
  constructor(
    @Inject(Microservice.MESSAGE_BROKER)
    private readonly client: ClientProxy,
    private readonly config_service: ConfigService,
  ) {}

  @OnEvent(SocketListenerEvent.REQUEST_CREATED)
  async onRequestCreated(event: IRequestCreatedEvent): Promise<void> {
    this.client.emit(RcpOutputEvent.SEND_MESSAGE, {
      owner_username: event.owner_username,
      message: ':)',
      session_id: this.config_service.get<string>(
        Environment.TIKTOK_SESSION_ID,
      ),
      target_idc: this.config_service.get<string>(
        Environment.TIKTOK_TARGET_IDC,
      ),
    });
  }

  @OnEvent(SocketListenerEvent.REQUEST_UPDATED)
  async onRequestUpdate(event: IRequestUpdatedEvent): Promise<void> {
    this.client.emit(RcpOutputEvent.SEND_MESSAGE, {
      owner_username: event.owner_username,
      message: ':)',
      session_id: this.config_service.get<string>(
        Environment.TIKTOK_SESSION_ID,
      ),
      target_idc: this.config_service.get<string>(
        Environment.TIKTOK_TARGET_IDC,
      ),
    });
  }
}
