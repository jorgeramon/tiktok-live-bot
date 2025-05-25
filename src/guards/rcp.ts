import { IMessage } from '@/interfaces/messages/message';
import { CacheService } from '@/services/cache';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class RcpGuard implements CanActivate {
  constructor(private readonly cache_service: CacheService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const message = context.switchToRpc().getData<IMessage>();
    return (
      (await this.cache_service.getAccountByUsername(
        message.owner_username,
      )) !== null
    );
  }
}
