import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('api/v1', { exclude: [''] });

  const configService = app.get(ConfigService);
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  const corsOptions = {
    origin: corsOrigin,
    credentials: true,
  };
  app.enableCors(corsOptions);

  const port = configService.get<number>('SERVER_PORT') || 4000;
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}
bootstrap();
