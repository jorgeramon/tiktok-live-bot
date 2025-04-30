// NestJS
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// Enums
import { Environment } from '@enums/environment';

// Gateways
import { TikTokGateway } from '@gateways/tiktok';

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
      { name: Request.name, schema: RequestSchema }
    ])
  ],
  controllers: [
    TikTokGateway
  ],
  providers: [
    AccountRepository,
    LiveRepository,
    RequestRepository,
    LiveService
  ],
})
export class AppModule { }
