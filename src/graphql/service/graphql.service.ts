// services/graphql.service.ts
import { ApolloClient } from '@apollo/client/core';
import { DocumentNode } from 'graphql';

export class GraphQLService {
  constructor(private readonly apolloClient: ApolloClient<any>) {}

  async fetchData<T>(query: DocumentNode, variables?: any): Promise<T> {
    try {
      const { data } = await this.apolloClient.query({
        query,
        variables,
        fetchPolicy: 'network-only',
        // fetchPolicy: 'cache-first',           Don't use this in production if you don't want fetch the new data
      });
      return data;
    } catch (error) {
      console.log('Error fetching data:');
      console.dir(error, { depth: null });
      throw error;
    }
  }

  async mutateData<T>(mutation: DocumentNode, variables?: any): Promise<T> {
    try {
      const { data } = await this.apolloClient.mutate({
        mutation,
        variables,
        // update: (cache, { data }) => {
        //   if (data && data.createUser) {
        //     const existingData = cache.readQuery({
        //       query: FIND_ALL_USERS_QUERY,
        //     });

        //     if (existingData) {
        //       const updatedData = {
        //         ...existingData,
        //         users: [...existingData.users, data.createUser],
        //       };

        //       cache.writeQuery({
        //         query: FIND_ALL_USERS_QUERY,
        //         data: updatedData,
        //       });
        //     }
        //   }
        // },
      });
      return data;
    } catch (error) {
      console.log('Error mutating data:');
      console.dir(error, { depth: null });
      throw error;
    }
  }
}
