import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { PostService } from './post.service';
import { Post } from './entities/post.entity';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { UserInput } from 'src/user/dto/user.input';
import { DeleteResponse } from './type/delete-response.type';
// import { UseGuards } from '@nestjs/common';
// import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';

@Resolver(() => Post)
// @UseGuards(GqlAuthGuard)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Mutation(() => Post)
  createPost(
    @Args('createPostInput') createPostInput: CreatePostInput,
    @Args('user') user: UserInput,
  ) {
    return this.postService.create(createPostInput, user);
  }

  @Query(() => [Post], { name: 'findAllPosts' })
  findAll(
    @Args('UserId', { type: () => ID, nullable: true }) UserId?: string,
    @Args('isReply', { nullable: true }) isReply?: boolean,
  ) {
    return this.postService.findAll(UserId, isReply);
  }

  @Query(() => Post, { name: 'findOnePost' })
  findOne(
    @Args('PostId', { type: () => ID }) PostId: string,
    @Args('user') user: UserInput,
  ) {
    return this.postService.findOne(PostId, user);
  }

  @Mutation(() => Post)
  updatePost(
    @Args('PostId', { type: () => ID }) PostId: string,
    @Args('updatePostInput') updatePostInput: UpdatePostInput,
    @Args('user') user: UserInput,
  ) {
    return this.postService.updatePost(PostId, updatePostInput, user);
  }

  @Mutation(() => Post)
  updatePostLikes(
    @Args('PostId', { type: () => ID }) PostId: string,
    @Args('user') user: UserInput,
  ) {
    return this.postService.updatePostLikes(PostId, user);
  }
  @Mutation(() => Post)
  updateRetweet(
    @Args('PostId', { type: () => ID }) PostId: string,
    @Args('user') user: UserInput,
  ) {
    return this.postService.updateRetweet(PostId, user);
  }

  @Mutation(() => DeleteResponse)
  removePost(
    @Args('PostId', { type: () => ID }) PostId: string,
    @Args('user') user: UserInput,
  ): Promise<DeleteResponse> {
    return this.postService.remove(PostId, user);
  }
}
