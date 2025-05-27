import { ErrorCode } from '@/enums/event';

export interface ISocketEvent<T = unknown> {
  ok: boolean;
  data: T;
  code?: ErrorCode;
}
