import { CommandResolver } from "@core/command-resolver";
import { TiktokInputEvent } from "@enums/event";
import { IChatMessage } from "@interfaces/chat-message";
import { IEndMessage } from "@interfaces/end-message";
import { IOnlineMessage } from "@interfaces/online-message";
import { IOnlineStatusMessage } from "@interfaces/online-status.message";
import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { LiveService } from "@services/live";

@Controller()
export class TiktokController {

    constructor(
        private readonly command_resolver: CommandResolver,
        private readonly live_service: LiveService
    ) { }

    @EventPattern(TiktokInputEvent.ONLINE_STATUS)
    async isOnline(@Payload() message: IOnlineStatusMessage): Promise<void> {
        this.live_service.setOnlineStatus(message.owner_username, message.is_online, message.room_info?.stream_id);
    }

    @EventPattern(TiktokInputEvent.ONLINE)
    async onOnline(@Payload() message: IOnlineMessage): Promise<void> {
        this.live_service.setOnlineStatus(message.owner_username, true, message.stream_id);
    }

    @EventPattern(TiktokInputEvent.CHAT)
    async onChat(@Payload() message: IChatMessage): Promise<void> {
        await this.command_resolver.resolve(message);
    }

    @EventPattern(TiktokInputEvent.END)
    async onEnd(@Payload() message: IEndMessage): Promise<void> {
        this.live_service.setOnlineStatus(message.owner_username, false, message.stream_id);
    }
}