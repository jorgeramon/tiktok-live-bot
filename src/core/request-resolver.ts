// NestJS
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

// Interfaces
import { ICommandEvent } from "@interfaces/command-event";

// Enums
import { RequestFeatureEvent } from "@enums/event";

@Injectable()
export class RequestResolver {

    @OnEvent(RequestFeatureEvent.PLAY)
    async onPlay(event: ICommandEvent): Promise<void> {
        console.log('play event')
        console.log(event);
    }
}