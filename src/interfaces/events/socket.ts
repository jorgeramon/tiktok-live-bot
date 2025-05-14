import { ErrorCode, SocketAcknowlegment } from '@/enums/event';

export interface ISocketEvent<T = unknown> {
  ok: boolean;
  data: T;
  code?: ErrorCode;
}

export interface ISocketEventResponse {
  body: ISocketEvent;
  acknowlegment: SocketAcknowlegment;
}
