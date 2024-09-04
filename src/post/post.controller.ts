import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Render,
  Req,
  UseGuards,
  // UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  CREATE_POST_MUTATION,
  DELETE_POST_MUTATION,
  FIND_ALL_POSTS_QUERY,
  FIND_ONE_POST_QUERY,
  UPDATE_POST_LIKES_MUTATION,
  UPDATE_POST_MUTATION,
  UPDATE_POST_PINNED_MUTATION,
  UPDATE_RETWEET_MUTATION,
} from 'src/graphql/queries/post.queries';
import { GraphQLService } from 'src/graphql/service/graphql.service';
import { ApolloClient } from '@apollo/client/core';
import { CreatePostInput } from './dto/create-post.input';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { UpdatePostInput } from './dto/update-post.input';
import { TokenPayload } from 'src/auth/token-payload.interface';
import { User } from 'src/user/entities/user.entity';
// import { CacheInterceptor } from '@nestjs/cache-manager';
// import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';

// @UseInterceptors(CacheInterceptor)
@Controller('post')
@UseGuards(JwtAuthGuard)
// @UseGuards(AuthenticatedGuard)
export class PostController {
  private readonly graphqlService: GraphQLService;
  constructor(
    @Inject('APOLLO_CLIENT') private readonly apolloClient: ApolloClient<any>,
  ) {
    this.graphqlService = new GraphQLService(apolloClient);
  }
  @Post('/api')
  async createPost(@Req() req) {
    const payload = req.body as CreatePostInput;
    if (payload.Content === '' || !payload.Content) {
      throw new BadRequestException('Invalid data');
    }
    try {
      const newPost = await this.graphqlService.mutateData<any>(
        CREATE_POST_MUTATION,
        { createPostInput: payload, UserId: req.user.UserId },
      );
      return newPost.createPost;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }

  @Get('/api')
  async getPosts(
    @Query()
    query: {
      postedBy?: string;
      isReply?: string;
      followingOnly: string;
    },
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      if (query.isReply !== undefined) {
        const isReply = query.isReply == 'true';
        const posts = await this.graphqlService.fetchData<any>(
          FIND_ALL_POSTS_QUERY,
          { UserId: query.postedBy, isReply },
        );
        return posts.findAllPosts;
      }
      if (query.followingOnly !== undefined) {
        const FollowingOnly = query.followingOnly == 'true';
        const posts = await this.graphqlService.fetchData<any>(
          FIND_ALL_POSTS_QUERY,
          { UserId: user.UserId, isReply: null, followingOnly: FollowingOnly },
        );
        return posts.findAllPosts;
      }
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }

  @Get('/api/:PostId')
  async getOnePost(@Param('PostId') PostId: string) {
    try {
      const post = await this.graphqlService.fetchData<any>(
        FIND_ONE_POST_QUERY,
        { PostId },
      );
      return post.findOnePost;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }

  @Put('/api/:PostId/update')
  async updatePost(
    @Param('PostId') PostId: string,
    @Body() updatePostInput: UpdatePostInput,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const updatedPost = await this.graphqlService.mutateData<any>(
        UPDATE_POST_MUTATION,
        {
          PostId,
          updatePostInput,
          UserId: user.UserId,
        },
      );
      return updatedPost;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }

  @Put('/api/:PostId/like')
  async updatePostLikes(
    @Param('PostId') PostId: string,
    @CurrentUser() user: User,
  ) {
    try {
      const updatedPost = await this.graphqlService.mutateData<any>(
        UPDATE_POST_LIKES_MUTATION,
        {
          PostId,
          UserId: user.UserId,
        },
      );
      return updatedPost.updatePostLikes;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }

  @Post('/api/:PostId/retweet')
  async updateRetweet(
    @Param('PostId') PostId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const updatedPost = await this.graphqlService.mutateData<any>(
        UPDATE_RETWEET_MUTATION,
        {
          PostId,
          UserId: user.UserId,
        },
      );
      return updatedPost.updateRetweet;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }

  @Get('/:PostId')
  @Render('postPage')
  async dynamicPost(
    @Param('PostId') PostId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return {
      pageTitle: 'View post',
      userLoggedIn: user,
      userLoggedInJs: JSON.stringify(user),
      postId: PostId,
    };
  }

  @Delete('/api/:PostId')
  async deletePost(
    @Param('PostId') PostId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const deletedPost = await this.graphqlService.mutateData<any>(
        DELETE_POST_MUTATION,
        {
          PostId,
          UserId: user.UserId,
        },
      );
      return deletedPost;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }

  @Put('/api/:PostId')
  async updatePinned(
    @Param('PostId') PostId: string,
    @Body() body,
    @CurrentUser() user: User,
  ) {
    const Pinned = body.Pinned == 'true';
    try {
      const updatedPost = await this.graphqlService.mutateData<any>(
        UPDATE_POST_PINNED_MUTATION,
        {
          PostId,
          UserId: user.UserId,
          Pinned,
        },
      );
      return updatedPost.updatePinned;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }
}
