import { CacheService } from '@/services/cache';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class SocketGuard implements CanActivate {
  constructor(private readonly cache_service: CacheService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket = context.switchToWs().getClient();
    return (
      (await this.cache_service.getAccountById(
        socket.handshake.auth.account_id,
      )) !== null
    );
  }
}
