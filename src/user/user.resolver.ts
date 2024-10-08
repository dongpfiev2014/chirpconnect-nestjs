import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { TokenPayload } from 'src/auth/token-payload.interface';

@Resolver((_of) => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  // @UseGuards(GqlAuthGuard)
  @Query(() => [User], { name: 'findAllUsers' })
  findAll(
    @Args('search', { type: () => String, nullable: true }) search?: string,
  ) {
    return this.userService.findAll(search);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { name: 'findOneUser' })
  findOne(@Args('UserId', { type: () => ID }) UserId: string) {
    return this.userService.findOne(UserId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User)
  updateUser(
    @CurrentUser() user: TokenPayload,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<User> {
    return this.userService.update(user.UserId, updateUserInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  removeUser(@CurrentUser() user: TokenPayload): Promise<boolean> {
    return this.userService.remove(user.UserId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { name: 'GetMe' })
  getMe(@CurrentUser() user: TokenPayload) {
    return user;
  }

  @Query(() => User, { name: 'findProfile' })
  findProfile(@Args('Username', { type: () => String }) Username: string) {
    return this.userService.findProfile(Username);
  }

  @Mutation(() => User)
  followUser(
    @Args('ProfileId', { type: () => ID }) ProfileId: string,
    @Args('UserId', { type: () => ID }) UserId: string,
  ) {
    return this.userService.followUser(ProfileId, UserId);
  }

  @Query(() => User, { name: 'renderFollowingUser' })
  renderFollowingUser(@Args('UserId', { type: () => ID }) UserId: string) {
    return this.userService.renderFollowingUser(UserId);
  }

  @Query(() => User, { name: 'renderFollowers' })
  renderFollowers(@Args('UserId', { type: () => ID }) UserId: string) {
    return this.userService.renderFollowers(UserId);
  }

  @Query(() => String)
  testRedis() {
    return this.userService.testRedis();
  }
}
