import { IMessage } from "@interfaces/message";

export interface IOnlineMessage extends IMessage {
    title?: string;
    share_url?: string;
    picture_large?: string;
    picture_medium?: string;
    picture_thumb?: string;
}