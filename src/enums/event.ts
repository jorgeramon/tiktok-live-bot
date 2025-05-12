export enum TiktokInputEvent {
    ONLINE = 'tiktok.online',
    CHAT = 'tiktok.chat',
    END = 'tiktok.end',
    ONLINE_STATUS = 'tiktok.online_status'
}

export enum TiktokOutputEvent {
    IS_ONLINE = 'tiktok.is_online'
}

export enum DatabaseEvent {
    ACCOUNT_CREATED = 'account.created'
}

export enum SocketEvent {
    CONNECTED = 'socket.connect',
    DISCONNECTED = 'socket.disconnected'
}

export enum SocketListenerEvent {
    REQUEST_CREATED = 'request.created',
    ONLINE_STATUS = 'online.status'
}

export enum CommandListenerEvent {
    REQUEST_PLAY = 'request.play'
}

export enum SocketInputEvent {
    GET_STATUS = 'get.status',
    GET_REQUESTS = 'get.requests',
    COMPLETE_REQUEST = 'complete.request'
}

export enum SocketOutputEvent {
    GET_REQUESTS = '{account_id}.requests',
    GET_STATUS = '{account_id}.status',
    REQUEST_CREATED = '{account_id}.request',
    REQUEST_COMPLETED = '{account_id}.request.completed'
}

export enum SocketAcknowlegment {
    OK = 'ok',
    ERROR = 'error'
}

export enum ErrorCode {
    USER_OFFLINE = 'user_offline_error'
}