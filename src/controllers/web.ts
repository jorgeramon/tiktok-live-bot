import { TransformInterceptor } from '@/interceptors/transform';
import { IRequest } from '@/interfaces/request';
import { LiveService } from '@/services/live';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';

@UseInterceptors(TransformInterceptor)
@Controller('api/tiktok/:id')
export class WebController {
  constructor(private readonly live_service: LiveService) {}

  @Get('requests')
  async findRequestsByAccoundId(
    @Param('id') account_id: string,
  ): Promise<IRequest[]> {
    return this.live_service.findRequestFromCurrentLive(account_id);
  }

  @Get('status')
  async findStatusByAccountId(
    @Param('id') account_id: string,
  ): Promise<boolean> {
    return this.live_service.getOnlineStatus(account_id);
  }

  @Post('messages')
  async sendMessages(
    @Param('id') account_id: string,
    @Body('message') message: string,
  ): Promise<void> {
    this.live_service.sendMessage(account_id, message);
  }
}
