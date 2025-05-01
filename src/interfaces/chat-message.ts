// Local
import { IMessage } from "./message";

export interface IChatMessage extends IMessage {
    comment: string;
    user_nickname: string;
    user_id: bigint;
    user_picture: string;
    is_moderator: boolean;
    is_new_gifter: boolean;
    is_subscriber: boolean;
}