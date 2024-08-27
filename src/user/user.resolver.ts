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

  @Query(() => [User], { name: 'findAllUsers' })
  @UseGuards(GqlAuthGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Query(() => User, { name: 'findOneUser' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('UserId', { type: () => ID }) UserId: string) {
    return this.userService.findOne(UserId);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  updateUser(
    @CurrentUser() user: TokenPayload,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<User> {
    return this.userService.update(user.UserId, updateUserInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeUser(@CurrentUser() user: TokenPayload): Promise<boolean> {
    return this.userService.remove(user.UserId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { name: 'Me' })
  getMe(@CurrentUser() user: TokenPayload) {
    return user;
  }

  @Query(() => String)
  testRedis() {
    return this.userService.testRedis();
  }
}
