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

//Using HTTPS with Cache

// const logoutLink = onError((error) => {
//   if (
//     error.graphQLErrors?.length &&
//     (error.graphQLErrors[0].extensions?.originalError as any)?.statusCode ===
//       401
//   ) {
//     if (!excludedRoutes.includes(window.location.pathname)) {
//       onLogout();
//     }
//   }
// });

// const authLink = setContext((_, { headers }) => {
//   return {
//     headers: {
//       ...headers,
//       authorization: getToken(),
//     },
//   };
// });

// const httpLink = new HttpLink({ uri: `${API_URL}/graphql` });

// const wsLink = new GraphQLWsLink(
//   createClient({
//     url: `${WS_URL}/graphql`,
//     connectionParams: {
//       token: getToken(),
//     },
//   }),
// );

// const splitLink = split(
//   ({ query }) => {
//     const definition = getMainDefinition(query);
//     return (
//       definition.kind === 'OperationDefinition' &&
//       definition.operation === 'subscription'
//     );
//   },
//   wsLink,
//   httpLink,
// );

// const client = new ApolloClient({
//   cache: new InMemoryCache({
//     typePolicies: {
//       Query: {
//         fields: {
//           chats: {
//             keyArgs: false,
//             merge,
//           },
//           messages: {
//             keyArgs: ['chatId'],
//             merge,
//           },
//         },
//       },
//     },
//   }),
//   link: logoutLink.concat(authLink).concat(splitLink),
// });
