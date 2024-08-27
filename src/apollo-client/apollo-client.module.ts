import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      inject: [ConfigService],
      provide: 'APOLLO_CLIENT',
      useFactory: (configService: ConfigService) => {
        const apiUrl = configService.get<string>('API_URL');
        return new ApolloClient({
          cache: new InMemoryCache(),
          uri: `${apiUrl}/graphql`,
        });
      },
    },
  ],
  exports: ['APOLLO_CLIENT'],
})
export class ApolloClientModule {}
