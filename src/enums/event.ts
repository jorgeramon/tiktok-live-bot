export enum TiktokEvent {
    ONLINE = 'tiktok.online',
    CHAT = 'tiktok.chat',
    END = 'tiktok.end',
    IS_ONLINE = 'tiktok.is_online'
}

export enum AccountEvent {
    CREATED = 'account.created'
}

export enum RequestEvent {
    CREATED = 'request.created'
}

export enum RequestCommandEvent {
    PLAY = 'request.play'
}

export enum SocketRequestEvent {
    GET_STATUS = 'get.status',
    GET_REQUESTS = 'get.requests'
}

export enum SocketResponseEvent {
    REQUESTS = '{account_id}.requests',
    STATUS = '{account_id}.status'
}

export enum SocketAcknowlegment {
    OK = 'ok',
    ERROR = 'error'
}

export enum ErrorCode {
    USER_OFFLINE = 'user_offline_error'
}