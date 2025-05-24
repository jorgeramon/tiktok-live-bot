import { CommandResolver } from '@/core/command-resolver';
import { PubSubInputEvent } from '@/enums/event';
import { RcpExceptionFilter } from '@/exception-filters/microservice';
import { RcpGuard } from '@/guards/rcp';
import { IChatMessage } from '@/interfaces/messages/chat';
import { IEndMessage } from '@/interfaces/messages/end';
import { IOnlineMessage } from '@/interfaces/messages/online';
import { IOnlineStatusMessage } from '@/interfaces/messages/online-status';
import { LiveService } from '@/services/live';
import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@UseFilters(RcpExceptionFilter)
@UseGuards(RcpGuard)
@Controller()
export class RcpController {
  constructor(
    private readonly command_resolver: CommandResolver,
    private readonly live_service: LiveService,
  ) {}

  @EventPattern(PubSubInputEvent.ONLINE_STATUS)
  async isOnline(@Payload() message: IOnlineStatusMessage): Promise<void> {
    this.live_service.setOnlineStatus(
      message.owner_username,
      message.is_online,
      message.room_info?.stream_id,
    );
  }

  @EventPattern(PubSubInputEvent.ONLINE)
  async onOnline(@Payload() message: IOnlineMessage): Promise<void> {
    this.live_service.setOnlineStatus(
      message.owner_username,
      true,
      message.stream_id,
    );
  }

  @EventPattern(PubSubInputEvent.CHAT)
  async onChat(@Payload() message: IChatMessage): Promise<void> {
    await this.command_resolver.resolve(message);
  }

  @EventPattern(PubSubInputEvent.END)
  async onEnd(@Payload() message: IEndMessage): Promise<void> {
    this.live_service.setOnlineStatus(
      message.owner_username,
      false,
      message.stream_id,
    );
  }
}
