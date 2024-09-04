import { ApolloClient } from '@apollo/client/core';
import { Controller, Get, Inject, Render, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TokenPayload } from 'src/auth/token-payload.interface';
import { GraphQLService } from 'src/graphql/service/graphql.service';

@Controller('message')
@UseGuards(JwtAuthGuard)
export class MessageController {
  private readonly graphqlService: GraphQLService;
  constructor(
    @Inject('APOLLO_CLIENT') private readonly apolloClient: ApolloClient<any>,
  ) {
    this.graphqlService = new GraphQLService(apolloClient);
  }

  @Get('')
  @Render('inboxPage')
  async root(@CurrentUser() user: TokenPayload) {
    return {
      pageTitle: 'Inbox',
      userLoggedIn: user,
      userLoggedInJs: JSON.stringify(user),
    };
  }

  @Get('/new')
  @Render('newMessage')
  async newMessage(@CurrentUser() user: TokenPayload) {
    try {
      //   const profile = await this.graphqlService.fetchData<any>(
      //     "FIND_USER_QUERY",
      //     {
      //       Username: user.Username,
      //     },
      //   );
      return {
        pageTitle: 'New Message',
        userLoggedIn: user,
        userLoggedInJs: JSON.stringify(user),
      };
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }
}
