import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  CREATE_POST_MUTATION,
  FIND_ALL_POSTS_QUERY,
} from 'src/graphql/queries/post.queries';
import { GraphQLService } from 'src/graphql/service/graphql.service';
import { ApolloClient } from '@apollo/client/core';
import { CreatePostInput } from './dto/create-post.input';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  private readonly graphqlService: GraphQLService;
  constructor(
    @Inject('APOLLO_CLIENT') private readonly apolloClient: ApolloClient<any>,
    private readonly postService: PostService,
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
  async getPost(@Req() req) {
    try {
      const posts = await this.graphqlService.fetchData<any>(
        FIND_ALL_POSTS_QUERY,
        { user: req.user },
      );
      return posts;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/api/:PostId')
  async deletePost(@Req() req, @Param('PostId') PostId: string) {
    try {
      const deletePost = await this.postService.remove(req.user, PostId);
      return deletePost;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }
}
