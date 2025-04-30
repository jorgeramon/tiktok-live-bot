// NestJS
import { Controller } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";

// Interfaces
import { IChatMessage } from "@interfaces/chat-message";
import { IOnlineMessage } from "@interfaces/online-message";

// Services
import { LiveService } from "@services/live";

// Core
import { CommandResolver } from "@core/command-resolver";

@Controller()
export class TikTokGateway {

    constructor (
        private readonly command_resolver: CommandResolver,
        private readonly live_service: LiveService
    ) {}

    @EventPattern('tiktok.online')
    async isOnline(event: IOnlineMessage): Promise<void> {
        await this.live_service.setOnlineStatus(event);
    }

    @EventPattern('tiktok.chat')
    async receiveChat(event: IChatMessage): Promise<void> {
        await this.command_resolver.resolve(event);
    }
}