import { Microservice } from '@/enums/environment';
import { TiktokOutputEvent } from '@/enums/event';
import { IAccount } from '@/interfaces/account';
import { AccountRepository } from '@/repositories/account';
import { Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

export class Startup implements OnApplicationBootstrap {
  private readonly logger: Logger = new Logger(Startup.name);

  constructor(
    @Inject(Microservice.MESSAGE_BROKER)
    private readonly client: ClientProxy,
    private readonly account_repository: AccountRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const accounts: IAccount[] = await this.account_repository.findAll();

    this.logger.debug(`Checking if accounts are online...`);

    for (const account of accounts) {
      this.client.emit(TiktokOutputEvent.IS_ONLINE, account.username);
    }
  }
}
