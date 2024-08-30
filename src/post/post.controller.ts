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

    try {
      const newPost = await this.graphqlService.mutateData<any>(
        CREATE_POST_MUTATION,
        { createPostInput: payload, user: req.user },
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
  async getPosts(@Req() req) {
    try {
      const posts = await this.graphqlService.fetchData<any>(
        FIND_ALL_POSTS_QUERY,
        { user: req.user },
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
      const post = await this.graphqlService.fetchData<any>(
        FIND_ONE_POST_QUERY,
        { PostId, user: req.user },
      );
      console.log(post);
      return post;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/api/:PostId')
  async deletePost(@Param('PostId') PostId: string, @Req() req) {
    try {
      const deletedPost = await this.graphqlService.mutateData<any>(
        DELETE_POST_MUTATION,
        {
          PostId,
          user: req.user,
        },
      );
      return deletedPost;
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
      console.log(PostId, updatePostInput, user);
      const updatedPost = await this.graphqlService.mutateData<any>(
        UPDATE_POST_MUTATION,
        {
          PostId,
          updatePostInput,
          user,
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
    @Body() updatePostInput: UpdatePostInput,
    @CurrentUser() user: User,
  ) {
    try {
      console.log(PostId, updatePostInput, user);
      const updatedPost = await this.graphqlService.mutateData<any>(
        UPDATE_POST_LIKES_MUTATION,
        {
          PostId,
          user,
        },
      );
      return updatedPost;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }
}
