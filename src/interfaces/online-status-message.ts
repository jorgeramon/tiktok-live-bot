import { IOnlineMessage } from "@interfaces/online-message";

export interface IOnlineStatusMessage {
    owner_username: string;
    is_online: boolean;
    room_info: IOnlineMessage;
}