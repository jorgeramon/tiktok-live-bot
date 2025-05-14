import { IRequest } from '@/interfaces/request';

export interface IRequestCreatedEvent {
  account_id: string;
  request: IRequest;
}

export interface IRequestUpdatedEvent {
  account_id: string;
  request: IRequest;
}
