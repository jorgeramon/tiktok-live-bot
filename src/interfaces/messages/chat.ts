import { IMessage } from "@interfaces/messages/message";

export interface IChatMessage extends IMessage {
    comment: string;
    user_id?: string;
    user_username?: string;
    user_nickname?: string;
    user_picture?: string;
}