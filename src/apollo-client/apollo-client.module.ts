import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { Global, Module } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Global()
@Module({
  providers: [
    {
      provide: 'APOLLO_CLIENT',
      useFactory: (req: Request) => {
        const protocol = req.protocol;
        const host = req.get('host');
        const apiUrl = `${protocol}://${host}/graphql`;
        return new ApolloClient({
          cache: new InMemoryCache(),
          uri: apiUrl,
        });
      },
      inject: [REQUEST],
    },
  ],
  exports: ['APOLLO_CLIENT'],
})
export class ApolloClientModule {}
