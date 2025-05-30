import { RcpController } from '@/controllers/rcp';
import { WebController } from '@/controllers/web';
import { CommandResolver } from '@/core/command-resolver';
import { Startup } from '@/core/startup';
import { Environment, Microservice } from '@/enums/environment';
import { SocketGateway } from '@/gateways/socket';
import { CacheListener } from '@/listeners/cache';
import { CommandListener } from '@/listeners/command';
import { AccountRepository } from '@/repositories/account';
import { LiveRepository } from '@/repositories/live';
import { RequestRepository } from '@/repositories/request';
import { Account, AccountSchema } from '@/schemas/account';
import { Live, LiveSchema } from '@/schemas/live';
import { Request, RequestSchema } from '@/schemas/request';
import { CacheService } from '@/services/cache';
import { LiveService } from '@/services/live';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';

const CORE = [CommandResolver];

const REPOSITORIES = [AccountRepository, LiveRepository, RequestRepository];

const SERVICES = [Startup, CacheService, LiveService];

const GATEWAYS = [SocketGateway];

const LISTENERS = [CommandListener, CacheListener];

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>(Environment.MONGO_ATLAS),
      }),
    }),
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: Live.name, schema: LiveSchema },
      { name: Request.name, schema: RequestSchema },
    ]),
    ClientsModule.registerAsync([
      {
        name: Microservice.MESSAGE_BROKER,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: configService.get<string>(Environment.REDIS_HOST),
            port: configService.get<number>(Environment.REDIS_PORT),
          },
        }),
      },
    ]),
    CacheModule.register(),
    EventEmitterModule.forRoot(),
  ],
  controllers: [RcpController, WebController],
  providers: [...CORE, ...REPOSITORIES, ...SERVICES, ...GATEWAYS, ...LISTENERS],
})
export class AppModule {}
