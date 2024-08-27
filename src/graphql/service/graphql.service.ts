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
      });
      return data;
    } catch (error) {
      console.log('Error mutating data:');
      console.dir(error, { depth: null });
      throw error;
    }
  }
}
