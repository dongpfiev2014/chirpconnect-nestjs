// import { ApolloClient } from '@apollo/client/core';
import { Controller } from '@nestjs/common';
import { GraphQLService } from 'src/graphql/service/graphql.service';
// import { CreateUserInput } from './dto/create-user.input';

@Controller('user')
export class UserController {
  private readonly graphqlService: GraphQLService;
  constructor() {
    // @Inject('APOLLO_CLIENT') private readonly apolloClient: ApolloClient<any>,
    // this.graphqlService = new GraphQLService(apolloClient);
  }
}
