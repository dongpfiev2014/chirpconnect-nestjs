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
import { TokenPayload } from 'src/auth/token-payload.interface';
import { FIND_USER_QUERY } from 'src/graphql/queries/user.queries';
import { GraphQLService } from 'src/graphql/service/graphql.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  private readonly graphqlService: GraphQLService;
  constructor(
    @Inject('APOLLO_CLIENT') private readonly apolloClient: ApolloClient<any>,
  ) {
    this.graphqlService = new GraphQLService(apolloClient);
  }
  @Get('')
  @Render('profilePage')
  async renderProfile(@CurrentUser() user: TokenPayload) {
    console.log(user);
    try {
      const profile = await this.graphqlService.fetchData<any>(
        FIND_USER_QUERY,
        {
          Username: user.Username,
        },
      );
      return {
        pageTitle: profile.findProfile.Username,
        userLoggedIn: profile.findProfile,
        userLoggedInJs: JSON.stringify(profile.findProfile),
        profileUser: profile.findProfile,
      };
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }

  @Get('/:Username')
  @Render('profilePage')
  async dynamicProfile(
    @Param('Username') Username: string,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      if (Username === user.Username) {
        const profile = await this.graphqlService.fetchData<any>(
          FIND_USER_QUERY,
          {
            Username: user.Username,
          },
        );
        return {
          pageTitle: profile.findProfile.Username,
          userLoggedIn: profile.findProfile,
          userLoggedInJs: JSON.stringify(profile.findProfile),
          profileUser: profile.findProfile,
        };
      }
      const [guest, owner] = await Promise.all([
        this.graphqlService.fetchData<any>(FIND_USER_QUERY, { Username }),
        this.graphqlService.fetchData<any>(FIND_USER_QUERY, {
          Username: user.Username,
        }),
      ]);

      return {
        pageTitle: guest.findProfile.Username,
        userLoggedIn: owner.findProfile,
        userLoggedInJs: JSON.stringify(owner.findProfile),
        profileUser: guest.findProfile,
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

  @Get('/:Username/replies')
  @Render('profilePage')
  async dynamicProfileReplies(
    @Param('Username') Username: string,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const [guest, owner] = await Promise.all([
        this.graphqlService.fetchData<any>(FIND_USER_QUERY, { Username }),
        this.graphqlService.fetchData<any>(FIND_USER_QUERY, {
          Username: user.Username,
        }),
      ]);

      return {
        pageTitle: guest.findProfile.Username,
        userLoggedIn: owner.findProfile,
        userLoggedInJs: JSON.stringify(owner.findProfile),
        profileUser: guest.findProfile,
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

  @Get('/:Username/following')
  @Render('followersAndFollowing')
  async renderFollowing(
    @Param('Username') Username: string,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const [guest, owner] = await Promise.all([
        this.graphqlService.fetchData<any>(FIND_USER_QUERY, { Username }),
        this.graphqlService.fetchData<any>(FIND_USER_QUERY, {
          Username: user.Username,
        }),
      ]);

      return {
        pageTitle: guest.findProfile.Username,
        userLoggedIn: owner.findProfile,
        userLoggedInJs: JSON.stringify(owner.findProfile),
        profileUser: guest.findProfile,
        selectedTab: 'following',
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

  @Get('/:Username/followers')
  @Render('followersAndFollowing')
  async renderFollowers(
    @Param('Username') Username: string,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const [guest, owner] = await Promise.all([
        this.graphqlService.fetchData<any>(FIND_USER_QUERY, { Username }),
        this.graphqlService.fetchData<any>(FIND_USER_QUERY, {
          Username: user.Username,
        }),
      ]);
      return {
        pageTitle: guest.findProfile.Username,
        userLoggedIn: owner.findProfile,
        userLoggedInJs: JSON.stringify(owner.findProfile),
        profileUser: guest.findProfile,
        selectedTab: 'followers',
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
