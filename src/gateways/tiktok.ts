// NestJS
import { Controller } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";

// Interfaces
import { IChatMessage } from "@interfaces/chat-message";
import { IOnlineMessage } from "@interfaces/online-message";

// Services
import { LiveService } from "@services/live";

@Controller()
export class TikTokGateway {

    constructor (private readonly live_service: LiveService) {}

    @EventPattern('tiktok.online')
    async isOnline(event: IOnlineMessage) {
        await this.live_service.setOnlineStatus(event);
    }

    @EventPattern('tiktok.chat')
    receiveChat(event: IChatMessage) {
        //console.log(event);
    }
}