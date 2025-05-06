// NestJS
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClientsModule, Transport } from '@nestjs/microservices';

// Enums
import { Environment } from '@enums/environment';

// Controllers
import { TiktokController } from '@controllers/tiktok';

// Gateways
import { SocketGateway } from '@gateways/socket';

// Schemas
import { Account, AccountSchema } from '@schemas/account';
import { Live, LiveSchema } from '@schemas/live';
import { Request, RequestSchema } from '@schemas/request';

// Repositories
import { AccountRepository } from '@repositories/account';
import { LiveRepository } from '@repositories/live';
import { RequestRepository } from '@repositories/request';

// Services
import { LiveService } from '@services/live';
import { CacheService } from '@services/cache';

// Guards
import { AccountGuard } from '@guards/account';

// Core
import { CommandResolver } from '@core/command-resolver';
import { RequestResolver } from '@core/request-resolver';

const CORE = [
  CommandResolver,
  RequestResolver,
];

const REPOSITORIES = [
  AccountRepository,
  LiveRepository,
  RequestRepository,
];

const SERVICES = [
  LiveService,
  CacheService
];

const GUARDS = [
  {
    provide: APP_GUARD,
    useClass: AccountGuard,
  }
];

const GATEWAYS = [
  SocketGateway
];

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>(Environment.MONGO_ATLAS)
      }),
    }),
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: Live.name, schema: LiveSchema },
      { name: Request.name, schema: RequestSchema },
    ]),
    ClientsModule.registerAsync([{
      name: 'MESSAGE_BROKER',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: Transport.REDIS,
        options: {
          host: configService.get<string>(Environment.REDIS_HOST),
          port: configService.get<number>(Environment.REDIS_PORT),
        }
      }),
    }]),
    CacheModule.register(),
    EventEmitterModule.forRoot()
  ],
  controllers: [
    TiktokController
  ],
  providers: [
    ...CORE,
    ...REPOSITORIES,
    ...SERVICES,
    ...GUARDS,
    ...GATEWAYS
  ],
})
export class AppModule { }
