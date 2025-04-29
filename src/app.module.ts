// NestJS
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// Enums
import { Environment } from '@enums/environment';

// Gateways
import { TikTokGateway } from '@gateways/tiktok';

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
  ],
  controllers: [
    TikTokGateway
  ],
  providers: [],
})
export class AppModule { }
