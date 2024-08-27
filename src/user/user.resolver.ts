import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Resolver((_of) => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  @Query(() => [User], { name: 'findAllUsers' })
  findAll() {
    return this.userService.findAll();
  }

  @Query(() => User, { name: 'findOneUser' })
  findOne(@Args('UserId', { type: () => ID }) UserId: string) {
    return this.userService.findOne(UserId);
  }

  @Mutation(() => User)
  updateUser(
    @Args('UserId', { type: () => ID }) UserId: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<User> {
    return this.userService.update(UserId, updateUserInput);
  }

  @Mutation(() => Boolean)
  removeUser(
    @Args('UserId', { type: () => ID }) UserId: string,
  ): Promise<boolean> {
    return this.userService.remove(UserId);
  }

  @Query(() => String)
  testRedis() {
    return this.userService.testRedis();
  }
}
