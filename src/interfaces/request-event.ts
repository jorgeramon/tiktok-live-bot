import { IRequest } from "@interfaces/request";

export interface IRequestEvent {
    account_id: string;
    request: IRequest
}