import {
  Module,
  // NestModule, MiddlewareConsumer
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from './config.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ApolloClientModule } from './apollo-client/apollo-client.module';
import { AuthModule } from './auth/auth.module';
// import { RedirectMiddleware } from './middleware/redirect.middleware';
import { RedirectInterceptor } from './interceptor/redirect.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mssql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize:
          configService.get('NODE_ENV') === 'production' ? false : true,
        logging: true,
        options: {
          encrypt: true,
          enableArithAbort: true,
          connectionTimeout: 30000,
          requestTimeout: 30000,
        },
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      debug: true,
      playground: true,
      introspection: true,
      context: ({ req }) => ({ req }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        // This works on the cache in the Memory Server.
        // ttl: parseInt(configService.get<string>('CACHE_TTL'), 10),

        // This works on the Redis Cloud.
        store: await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
          },
          password: configService.get<string>('REDIS_PASSWORD'),
          ttl: configService.get<number>('CACHE_TTL'),
        }),
      }),
    }),
    UserModule,
    ApolloClientModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RedirectInterceptor,
    },

    // This only works on CRUD - REST API, not for GraphQL

    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor,
    // },
  ],
})
// implements NestModule
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(RedirectMiddleware).exclude('/auth/login').forRoutes('*');
  // }
}
