// NestJS
import { IChatEvent } from "@interfaces/chat-event";
import { IOnlineEvent } from "@interfaces/online-event";
import { Controller } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class TikTokGateway {

    @EventPattern('tiktok.online')
    isOnline(event: IOnlineEvent) {
        console.log(event);
    }

    @EventPattern('tiktok.chat')
    receiveChat(event: IChatEvent) {
        console.log(event);
    }
}