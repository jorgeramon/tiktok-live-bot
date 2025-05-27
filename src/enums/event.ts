export enum RcpInputEvent {
  ONLINE = 'tiktok.online',
  CHAT = 'tiktok.chat',
  END = 'tiktok.end',
  ONLINE_STATUS = 'tiktok.online_status',
}

export enum RcpOutputEvent {
  IS_ONLINE = 'tiktok.is_online',
}

export enum DatabaseEvent {
  ACCOUNT_CREATED = 'account.created',
}

export enum SocketEvent {
  CONNECTED = 'socket.connect',
  DISCONNECTED = 'socket.disconnected',
}

export enum SocketListenerEvent {
  REQUEST_CREATED = 'request.created',
  REQUEST_UPDATED = 'request.updated',
  ONLINE_STATUS = 'online.status',
}

export enum CommandListenerEvent {
  REQUEST_PLAY = 'request.play',
}

export enum SocketInputEvent {
  COMPLETE_REQUEST = 'complete.request',
}

export enum SocketOutputEvent {
  STATUS_UPDATED = '{account_id}.status',
  REQUEST_CREATED = '{account_id}.request.created',
  REQUEST_UPDATED = '{account_id}.request.updated',
}

export enum SocketAcknowlegment {
  OK = 'ok',
  ERROR = 'error',
}

export enum ErrorCode {
  USER_OFFLINE = 'user_offline_error',
  REQUEST_NOT_FOUND = 'request_not_found_error',
  UNKNOWN = 'unknown_error',
}
