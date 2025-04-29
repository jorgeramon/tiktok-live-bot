// NestJS
import { Controller } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";

// Interfaces
import { IChatMessage } from "@interfaces/chat-message";
import { IOnlineMessage } from "@interfaces/online-message";

@Controller()
export class TikTokGateway {

    @EventPattern('tiktok.online')
    isOnline(event: IOnlineMessage) {
        console.log(event);
    }

    @EventPattern('tiktok.chat')
    receiveChat(event: IChatMessage) {
        //console.log(event);
    }
}