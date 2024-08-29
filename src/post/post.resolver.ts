import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PostService } from './post.service';
import { Post } from './entities/post.entity';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { UserInput } from 'src/user/dto/user.input';
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
  findAll(@Args('user') user: UserInput) {
    return this.postService.findAll(user);
  }

  @Query(() => Post, { name: 'findOnePost' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.postService.findOne(id);
  }

  @Mutation(() => Post)
  updatePost(@Args('updatePostInput') updatePostInput: UpdatePostInput) {
    return this.postService.update(updatePostInput.id, updatePostInput);
  }

  // @Mutation(() => Post)
  // removePost(@Args('id', { type: () => Int }) id: number) {
  //   return this.postService.remove(id);
  // }
}
