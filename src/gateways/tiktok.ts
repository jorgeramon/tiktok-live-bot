// NestJS
import { IChatMessage } from "@interfaces/chat-message";
import { IOnlineMessage } from "@interfaces/online-message";
import { Controller } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";

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