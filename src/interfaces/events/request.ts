import { IRequest } from '@/interfaces/request';

export interface IRequestCreatedEvent {
  account_id: string;
  request: IRequest;
  owner_username: string;
  user_username: string;
  user_nickname: string;
  place: number;
}

export interface IRequestUpdatedEvent {
  account_id: string;
  request: IRequest;
  owner_username: string;
  user_username: string;
  user_nickname: string;
}
