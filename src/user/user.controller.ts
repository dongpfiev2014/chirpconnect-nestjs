import { ApolloClient } from '@apollo/client/core';
import { Controller, Inject, Param, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GraphQLService } from 'src/graphql/service/graphql.service';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
  private readonly graphqlService: GraphQLService;
  constructor(
    @Inject('APOLLO_CLIENT') private readonly apolloClient: ApolloClient<any>,
  ) {
    this.graphqlService = new GraphQLService(apolloClient);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/api/:UserId/follow')
  async followUser(@Param('UserId') UserId: string, @CurrentUser() user: User) {
    console.log(UserId, user);
    return {
      pageTitle: user.Username,
      userLoggedIn: user,
      userLoggedInJs: JSON.stringify(user),
      profileUser: user,
    };
  }
}
