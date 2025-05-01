export interface ICommandEvent {
    account_id: string;
    user_id: bigint;
    user_nickname: string;
    user_picture: string;
    stream_id: bigint;
    argument: string;
}