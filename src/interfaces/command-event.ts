export interface ICommandEvent {
    account_id: string;
    user_id: bigint;
    user_nickname: string;
    stream_id: bigint;
    argument: string;
}