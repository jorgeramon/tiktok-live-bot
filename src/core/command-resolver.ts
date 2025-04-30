// NestJS
import { Injectable } from "@nestjs/common";

// Interfaces
import { IChatMessage } from "@interfaces/chat-message";

@Injectable()
export class CommandResolver {

    async resolve(event: IChatMessage): Promise<void> {
        
    }
}