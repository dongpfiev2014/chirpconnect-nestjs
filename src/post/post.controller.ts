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
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  CREATE_POST_MUTATION,
  DELETE_POST_MUTATION,
  FIND_ALL_POSTS_QUERY,
  FIND_ONE_POST_QUERY,
  UPDATE_POST_LIKES_MUTATION,
  UPDATE_POST_MUTATION,
  UPDATE_RETWEET_MUTATION,
} from 'src/graphql/queries/post.queries';
import { GraphQLService } from 'src/graphql/service/graphql.service';
import { ApolloClient } from '@apollo/client/core';
import { CreatePostInput } from './dto/create-post.input';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { UpdatePostInput } from './dto/update-post.input';

@Controller('post')
export class PostController {
  private readonly graphqlService: GraphQLService;
  constructor(
    @Inject('APOLLO_CLIENT') private readonly apolloClient: ApolloClient<any>,
  ) {
    this.graphqlService = new GraphQLService(apolloClient);
  }
  @UseGuards(JwtAuthGuard)
  @Post('/api')
  async createPost(@Req() req) {
    const payload = req.body as CreatePostInput;
    if (payload.Content === '' || !payload.Content) {
      throw new BadRequestException('Invalid data');
    }
    const { Followers, Following, ...userInput } = req.user;
    try {
      const newPost = await this.graphqlService.mutateData<any>(
        CREATE_POST_MUTATION,
        { createPostInput: payload, user: userInput },
      );
      return newPost.createPost;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/api')
  async getPosts(@Query() query: { postedBy?: string; isReply?: string }) {
    try {
      if (query.isReply !== undefined) {
        const isReply = query.isReply == 'true';
        const posts = await this.graphqlService.fetchData<any>(
          FIND_ALL_POSTS_QUERY,
          { UserId: query.postedBy, isReply },
        );
        return posts.findAllPosts;
      }
      const posts = await this.graphqlService.fetchData<any>(
        FIND_ALL_POSTS_QUERY,
        { UserId: null, isReply: null },
      );
      return posts.findAllPosts;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/api/:PostId')
  async getOnePost(@Param('PostId') PostId: string, @Req() req) {
    try {
      const { Followers, Following, ...userInput } = req.user;

      const post = await this.graphqlService.fetchData<any>(
        FIND_ONE_POST_QUERY,
        { PostId, user: userInput },
      );
      return post.findOnePost;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('/api/:PostId/update')
  async updatePost(
    @Param('PostId') PostId: string,
    @Body() updatePostInput: UpdatePostInput,
    @CurrentUser() user: User,
  ) {
    try {
      const { Followers, Following, ...userInput } = user;
      const updatedPost = await this.graphqlService.mutateData<any>(
        UPDATE_POST_MUTATION,
        {
          PostId,
          updatePostInput,
          user: userInput,
        },
      );
      return updatedPost;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }
  @UseGuards(JwtAuthGuard)
  @Put('/api/:PostId/like')
  async updatePostLikes(
    @Param('PostId') PostId: string,
    @CurrentUser() user: User,
  ) {
    const { Followers, Following, ...userInput } = user;
    try {
      const updatedPost = await this.graphqlService.mutateData<any>(
        UPDATE_POST_LIKES_MUTATION,
        {
          PostId,
          user: userInput,
        },
      );
      return updatedPost.updatePostLikes;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }
  @UseGuards(JwtAuthGuard)
  @Post('/api/:PostId/retweet')
  async updateRetweet(
    @Param('PostId') PostId: string,
    @CurrentUser() user: User,
  ) {
    try {
      const { Followers, Following, ...userInput } = user;
      const updatedPost = await this.graphqlService.mutateData<any>(
        UPDATE_RETWEET_MUTATION,
        {
          PostId,
          user: userInput,
        },
      );
      return updatedPost.updateRetweet;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:PostId')
  @Render('postPage')
  async dynamicPost(
    @Param('PostId') PostId: string,
    @CurrentUser() user: User,
  ) {
    return {
      pageTitle: 'View post',
      userLoggedIn: user,
      userLoggedInJs: JSON.stringify(user),
      postId: PostId,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/api/:PostId')
  async deletePost(@Param('PostId') PostId: string, @Req() req) {
    try {
      const { Followers, Following, ...userInput } = req.user;
      const deletedPost = await this.graphqlService.mutateData<any>(
        DELETE_POST_MUTATION,
        {
          PostId,
          user: userInput,
        },
      );
      return deletedPost;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }
}
