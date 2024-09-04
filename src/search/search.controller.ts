import {
  Controller,
  Get,
  Inject,
  Param,
  Render,
  UseGuards,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { TokenPayload } from 'src/auth/token-payload.interface';
import { ApolloClient } from '@apollo/client/core';
import { GraphQLService } from 'src/graphql/service/graphql.service';
import { FIND_USER_QUERY } from 'src/graphql/queries/user.queries';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  private readonly graphqlService: GraphQLService;
  constructor(
    private readonly searchService: SearchService,
    @Inject('APOLLO_CLIENT') private readonly apolloClient: ApolloClient<any>,
  ) {
    this.graphqlService = new GraphQLService(apolloClient);
  }

  @Get('')
  @Render('searchPage')
  async root(@CurrentUser() user: TokenPayload) {
    return {
      pageTitle: 'Search',
      userLoggedIn: user,
      userLoggedInJs: JSON.stringify(user),
    };
  }

  @Get('/:selectedTab')
  @Render('searchPage')
  async handleSearch(
    @Param('selectedTab') selectedTab,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const profile = await this.graphqlService.fetchData<any>(
        FIND_USER_QUERY,
        {
          Username: user.Username,
        },
      );
      return {
        pageTitle: 'Search',
        userLoggedIn: profile.findProfile,
        userLoggedInJs: JSON.stringify(profile.findProfile),
        selectedTab,
      };
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }
}
