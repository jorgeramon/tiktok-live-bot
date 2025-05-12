import { ILive } from "@interfaces/live";

export interface IOnlineStatusEvent {
    is_online: boolean;
    account_id: string;
    live: ILive | null;
}