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
