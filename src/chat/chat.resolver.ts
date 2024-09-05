import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { Chat } from './entities/chat.entity';
import { UpdateChatInput } from './dto/update-chat.input';
import { CreateChatInput } from './dto/create-chat.input';

@Resolver(() => Chat)
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  @Mutation(() => Chat)
  createChat(
    @Args('createChatInput', { type: () => [CreateChatInput] })
    createChatInput: CreateChatInput[],
  ) {
    return this.chatService.create(createChatInput);
  }

  @Query(() => [Chat], { name: 'findAllChats' })
  findAll(@Args('UserId', { type: () => ID }) UserId: string) {
    return this.chatService.findAll(UserId);
  }

  @Query(() => Chat, { name: 'findOneChat' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.chatService.findOne(id);
  }

  @Mutation(() => Chat)
  updateChat(@Args('updateChatInput') updateChatInput: UpdateChatInput) {
    return this.chatService.update(updateChatInput.id, updateChatInput);
  }

  @Mutation(() => Chat)
  removeChat(@Args('id', { type: () => Int }) id: number) {
    return this.chatService.remove(id);
  }
}
