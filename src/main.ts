import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
// import * as session from 'express-session';
// import * as passport from 'passport';
// import Redis from 'ioredis';
// import RedisStore from 'connect-redis';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Applies to using session with redis

  // const redisClient = new Redis({
  //   host: configService.get<string>('REDIS_HOST'),
  //   port: configService.get<number>('REDIS_PORT'),
  //   username: 'default',
  //   password: configService.get<string>('REDIS_PASSWORD'),
  //   db: 0,
  // });
  // const redisStore = new RedisStore({
  //   client: redisClient,
  //   ttl: 24 * 60 * 60, // 1 day
  // });

  // redisClient.on('error', (err) => console.error('Redis error: ', err));
  // redisClient.on('connect', () => console.log('Connected to Redis'));

  // app.use(
  //   session({
  //     store: redisStore,
  //     resave: false,
  //     saveUninitialized: false,
  //     secret: 'Believe in yourself, Bro !!',
  //     cookie: {
  //       httpOnly: true,
  //       secure: configService.get<string>('NODE_ENV') === 'production',
  //       maxAge: 1000 * 60 * 60 * 24, // 1 days
  //       sameSite: 'strict',
  //     },
  //   }),
  // );

  // app.use(passport.initialize());
  // app.use(passport.session());

  app.useStaticAssets(path.join(__dirname, '..', 'public')); // public folder
  app.setBaseViewsDir(path.join(__dirname, '..', 'views'));
  app.setViewEngine('pug');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // app.setGlobalPrefix('api/v1', { exclude: ['/user/(.*)', ''] });

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
