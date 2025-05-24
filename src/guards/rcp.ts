import { AccountGuard } from '@/guards/account';
import { IMessage } from '@/interfaces/messages/message';
import { CacheService } from '@/services/cache';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class RcpGuard extends AccountGuard implements CanActivate {
  constructor(cache_service: CacheService) {
    super(cache_service);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const message = context.switchToRpc().getData<IMessage>();
    return super.isValid(message.owner_username);
  }
}
