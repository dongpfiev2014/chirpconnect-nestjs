import { ApolloClient } from '@apollo/client/core';
import { Controller, Get, Inject, Render } from '@nestjs/common';
import {
  CREATE_USER_MUTATION,
  FIND_ALL_USERS_QUERY,
} from 'src/graphql/queries/user.queries';
import { GraphQLService } from 'src/graphql/service/graphql.service';

@Controller('user')
export class UserController {
  private readonly graphqlService: GraphQLService;
  constructor(
    @Inject('APOLLO_CLIENT') private readonly apolloClient: ApolloClient<any>,
  ) {
    this.graphqlService = new GraphQLService(apolloClient);
  }

  @Get()
  @Render('user/index')
  async root() {
    const userInput = {
      FirstName: 'John',
      LastName: 'Doe',
      Username: 'john.doe10',
      Email: 'john.doe10@example.com',
      Password: 'Password123@',
    };

    const users =
      await this.graphqlService.fetchData<any>(FIND_ALL_USERS_QUERY);

    const newUser = await this.graphqlService.mutateData<any>(
      CREATE_USER_MUTATION,
      { input: userInput },
    );

    return {
      fakeUsers: [
        {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@example.com',
          age: 30,
        },
        {
          id: 2,
          name: 'John Wath',
          email: 'john.Wath@example.com',
          age: 31,
        },
        {
          id: 3,
          name: 'John Doe2',
          email: 'john.doe@example.com',
          age: 32,
        },
        {
          id: 4,
          name: 'John Wath2',
          email: 'john.Wath@example.com',
          age: 33,
        },
      ],
      users: users.findAllUsers,
      newUser: newUser.createUser,
      pageTitle: 'User page Hahaha',
    };
  }
}
