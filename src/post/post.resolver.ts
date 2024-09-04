import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { PostService } from './post.service';
import { Post } from './entities/post.entity';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
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
    @Args('UserId', { type: () => ID }) UserId: string,
  ) {
    return this.postService.create(createPostInput, UserId);
  }

  @Query(() => [Post], { name: 'findAllPosts' })
  findAll(
    @Args('UserId', { type: () => ID, nullable: true }) UserId?: string,
    @Args('isReply', { nullable: true }) isReply?: boolean,
    @Args('followingOnly', { nullable: true }) followingOnly?: boolean,
  ) {
    return this.postService.findAll(UserId, isReply, followingOnly);
  }

  @Query(() => Post, { name: 'findOnePost' })
  findOne(@Args('PostId', { type: () => ID }) PostId: string) {
    return this.postService.findOne(PostId);
  }

  @Mutation(() => Post)
  updatePost(
    @Args('PostId', { type: () => ID }) PostId: string,
    @Args('updatePostInput') updatePostInput: UpdatePostInput,
    @Args('UserId', { type: () => ID }) UserId: string,
  ) {
    return this.postService.updatePost(PostId, updatePostInput, UserId);
  }

  @Mutation(() => Post)
  updatePostLikes(
    @Args('PostId', { type: () => ID }) PostId: string,
    @Args('UserId', { type: () => ID }) UserId: string,
  ) {
    return this.postService.updatePostLikes(PostId, UserId);
  }
  @Mutation(() => Post)
  updateRetweet(
    @Args('PostId', { type: () => ID }) PostId: string,
    @Args('UserId', { type: () => ID }) UserId: string,
  ) {
    return this.postService.updateRetweet(PostId, UserId);
  }

  @Mutation(() => DeleteResponse)
  removePost(
    @Args('PostId', { type: () => ID }) PostId: string,
    @Args('UserId', { type: () => ID }) UserId: string,
  ): Promise<DeleteResponse> {
    return this.postService.remove(PostId, UserId);
  }

  @Mutation(() => Post)
  updatePinned(
    @Args('PostId', { type: () => ID }) PostId: string,
    @Args('UserId', { type: () => ID }) UserId: string,
    @Args('Pinned', { type: () => Boolean }) Pinned: boolean,
  ) {
    return this.postService.updatePinned(PostId, UserId, Pinned);
  }
}
