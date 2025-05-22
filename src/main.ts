import { AppModule } from '@/app.module';
import { Environment } from '@/enums/environment';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config_service = app.get<ConfigService>(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: config_service.get<string>(Environment.REDIS_HOST),
      port: config_service.get<number>(Environment.REDIS_PORT),
    },
  });

  app.enableCors();
  await app.startAllMicroservices();
  await app.listen(config_service.get<number>(Environment.SERVER_PORT) || 2222);
}

bootstrap();
