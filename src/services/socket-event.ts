import { ErrorCode, SocketAcknowlegment } from '@/enums/event';
import { ISocketEventResponse } from '@/interfaces/events/socket';
import { ILive } from '@/interfaces/live';
import { IRequest } from '@/interfaces/request';
import { LiveRepository } from '@/repositories/live';
import { RequestRepository } from '@/repositories/request';
import { logException } from '@/utils/log-exception';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SocketEventService {
  private readonly logger: Logger = new Logger(SocketEventService.name);

  constructor(
    private readonly live_repository: LiveRepository,
    private readonly request_repository: RequestRepository,
  ) {}

  async getStatus(account_id: string): Promise<ISocketEventResponse> {
    try {
      const live: ILive | null =
        await this.live_repository.findCurrentOnline(account_id);

      return this.buildResponse<boolean>(live !== null);
    } catch (err) {
      logException(this.logger, err);
      return this.buildError(ErrorCode.UNKNOWN);
    }
  }

  async getRequests(account_id: string): Promise<ISocketEventResponse> {
    try {
      const live: ILive | null =
        await this.live_repository.findCurrentOnline(account_id);

      if (!live) {
        throw new Error();
      }

      const requests: IRequest[] = await this.request_repository.findByLiveId(
        live._id,
      );

      return this.buildResponse<IRequest[]>(requests);
    } catch (err) {
      logException(this.logger, err);
      return this.buildError(ErrorCode.UNKNOWN);
    }
  }

  async completeRequest(
    account_id: string,
    request_id: string,
  ): Promise<ISocketEventResponse> {
    try {
      const live: ILive | null =
        await this.live_repository.findCurrentOnline(account_id);

      if (!live) {
        throw new Error();
      }

      const updated_request: IRequest | null =
        await this.request_repository.update(request_id, {
          current: false,
          completed: true,
          completed_at: new Date(),
        });

      if (!updated_request) {
        throw new Error();
      }

      return this.buildResponse<IRequest>(updated_request);
    } catch (err) {
      logException(this.logger, err);
      return this.buildError(ErrorCode.UNKNOWN);
    }
  }

  async selectRequest(
    account_id: string,
    request_id: string,
  ): Promise<ISocketEventResponse> {
    try {
      const live: ILive | null =
        await this.live_repository.findCurrentOnline(account_id);

      if (!live) {
        throw new Error();
      }

      const current_request: IRequest | null =
        await this.request_repository.findOneByLiveIdAndCurrent(live._id, true);

      if (current_request !== null) {
        await this.request_repository.update(current_request._id, {
          current: false,
        });
      }

      const updated_request: IRequest | null =
        await this.request_repository.update(request_id, {
          current: true,
        });

      if (!updated_request) {
        throw new Error();
      }

      return this.buildResponse<IRequest>(updated_request);
    } catch (err) {
      logException(this.logger, err);
      return this.buildError(ErrorCode.UNKNOWN);
    }
  }

  private buildResponse<T>(data: T): ISocketEventResponse {
    return {
      body: {
        ok: true,
        data,
      },
      acknowlegment: SocketAcknowlegment.OK,
    };
  }

  private buildError(code: ErrorCode): ISocketEventResponse {
    return {
      body: {
        ok: false,
        data: null,
        code,
      },
      acknowlegment: SocketAcknowlegment.ERROR,
    };
  }
}
