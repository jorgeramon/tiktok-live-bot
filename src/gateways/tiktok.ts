// NestJS
import { Controller, Logger } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";

// Enums
import { TiktokEvent } from "@enums/event";

// Interfaces
import { IChatMessage } from "@interfaces/chat-message";
import { IOnlineMessage } from "@interfaces/online-message";
import { IEndMessage } from "@interfaces/end-message";

// Services
import { LiveService } from "@services/live";

// Core
import { CommandResolver } from "@core/command-resolver";

@Controller()
export class TikTokGateway {

    private readonly logger: Logger = new Logger(TikTokGateway.name);

    constructor (
        private readonly command_resolver: CommandResolver,
        private readonly live_service: LiveService
    ) {}

    @EventPattern(TiktokEvent.ONLINE)
    async isOnline(event: IOnlineMessage): Promise<void> {
        this.logger.log(`Account ${event.owner_nickname} is online`);
        await this.live_service.setOnlineStatus(event);
    }

    @EventPattern(TiktokEvent.CHAT)
    async receiveChat(event: IChatMessage): Promise<void> {
        await this.command_resolver.resolve(event);
    }

    @EventPattern(TiktokEvent.END)
    async isOffline(event: IEndMessage): Promise<void> {
        this.logger.log(`Account ${event.owner_nickname} is offline`);
        await this.live_service.setOfflineStatus(event);
    }
}