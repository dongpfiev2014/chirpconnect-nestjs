import { ApolloClient } from '@apollo/client/core';
import {
  Controller,
  Get,
  Inject,
  Param,
  Render,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FIND_USER_QUERY } from 'src/graphql/queries/user.queries';
import { GraphQLService } from 'src/graphql/service/graphql.service';
import { User } from 'src/user/entities/user.entity';

@Controller('profile')
export class ProfileController {
  private readonly graphqlService: GraphQLService;
  constructor(
    @Inject('APOLLO_CLIENT') private readonly apolloClient: ApolloClient<any>,
  ) {
    this.graphqlService = new GraphQLService(apolloClient);
  }
  @UseGuards(JwtAuthGuard)
  @Get('')
  @Render('profilePage')
  async renderProfile(@CurrentUser() user: User) {
    return {
      pageTitle: user.Username,
      userLoggedIn: user,
      userLoggedInJs: JSON.stringify(user),
      profileUser: user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:Username')
  @Render('profilePage')
  async dynamicProfile(
    @Param('Username') Username: string,
    @CurrentUser() user: User,
  ) {
    try {
      const profile = await this.graphqlService.fetchData<any>(
        FIND_USER_QUERY,
        { Username, user },
      );
      return {
        pageTitle: profile.Username,
        userLoggedIn: user,
        userLoggedInJs: JSON.stringify(user),
        profileUser: profile.findProfile,
      };
    } catch (error) {
      return {
        pageTitle: 'User not found',
        userLoggedIn: user,
        userLoggedInJs: JSON.stringify(user),
        errorMessage: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:Username/replies')
  @Render('profilePage')
  async dynamicProfileReplies(
    @Param('Username') Username: string,
    @CurrentUser() user: User,
  ) {
    try {
      const profile = await this.graphqlService.fetchData<any>(
        FIND_USER_QUERY,
        { Username, user },
      );
      return {
        pageTitle: profile.Username,
        userLoggedIn: user,
        userLoggedInJs: JSON.stringify(user),
        profileUser: profile.findProfile,
        selectedTab: 'replies',
      };
    } catch (error) {
      return {
        pageTitle: 'User not found',
        userLoggedIn: user,
        userLoggedInJs: JSON.stringify(user),
        errorMessage: error.message,
      };
    }
  }
}
