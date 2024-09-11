import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core';
import { Global, Module } from '@nestjs/common';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';

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
          link: new HttpLink({
            uri: apiUrl,
          }),
          cache: new InMemoryCache(),
          // uri: apiUrl,
        });
      },
      inject: [REQUEST],
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
