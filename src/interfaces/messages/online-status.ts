import { IOnlineMessage } from "@interfaces/messages/online";

export interface IOnlineStatusMessage {
    owner_username: string;
    is_online: boolean;
    room_info: IOnlineMessage;
}