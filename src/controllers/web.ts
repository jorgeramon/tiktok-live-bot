import { WebExceptionFilter } from '@/exception-filters/web';
import { TransformInterceptor } from '@/interceptors/transform';
import { IRequest } from '@/interfaces/request';
import { LiveService } from '@/services/live';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';

@UseFilters(WebExceptionFilter)
@UseInterceptors(TransformInterceptor)
@Controller('tiktok/:account_id')
export class WebController {
  constructor(private readonly live_service: LiveService) {}

  @Get('requests')
  async findRequestsByAccoundId(
    @Param('account_id') account_id: string,
  ): Promise<IRequest[]> {
    return this.live_service.findRequestFromCurrentLive(account_id);
  }

  @Put('requests/:request_id')
  async completeRequest(
    @Param('account_id') account_id: string,
    @Param('request_id') request_id: string,
  ): Promise<IRequest> {
    return this.live_service.completeRequest(account_id, request_id);
  }

  @Get('status')
  async findStatusByAccountId(
    @Param('account_id') account_id: string,
  ): Promise<boolean> {
    return this.live_service.getOnlineStatus(account_id);
  }

  @Post('messages')
  async sendMessages(
    @Param('account_id') account_id: string,
    @Body('message') message: string,
  ): Promise<void> {
    this.live_service.sendMessage(account_id, message);
  }
}
