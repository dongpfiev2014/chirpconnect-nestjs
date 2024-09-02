import { ApolloClient } from '@apollo/client/core';
import { Controller, Get, Inject, Param, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GraphQLService } from 'src/graphql/service/graphql.service';
import { User } from './entities/user.entity';
import {
  FOLLOW_USER_MUTATION,
  GET_FOLLOWERS_QUERY,
  GET_FOLLOWING_USER_QUERY,
} from 'src/graphql/queries/user.queries';

@Controller('user')
export class UserController {
  private readonly graphqlService: GraphQLService;
  constructor(
    @Inject('APOLLO_CLIENT') private readonly apolloClient: ApolloClient<any>,
  ) {
    this.graphqlService = new GraphQLService(apolloClient);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/api/:ProfileId/follow')
  async followUser(
    @Param('ProfileId') ProfileId: string,
    @CurrentUser() user: User,
  ) {
    try {
      const result = await this.graphqlService.mutateData<any>(
        FOLLOW_USER_MUTATION,
        { ProfileId, UserId: user.UserId },
      );
      return result.followUser;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/api/:UserId/following')
  async renderFollowing(@Param('UserId') UserId: string) {
    try {
      const result = await this.graphqlService.mutateData<any>(
        GET_FOLLOWING_USER_QUERY,
        { UserId },
      );
      return result.renderFollowingUser;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/api/:UserId/followers')
  async renderFollowers(@Param('UserId') UserId: string) {
    try {
      const result = await this.graphqlService.mutateData<any>(
        GET_FOLLOWERS_QUERY,
        { UserId },
      );

      return result.renderFollowers;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }
}
