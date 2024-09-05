import { ApolloClient } from '@apollo/client/core';
import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TokenPayload } from 'src/auth/token-payload.interface';
import {
  CREATE_CHAT_MUTATION,
  FIND_ALL_CHATS_QUERY,
} from 'src/graphql/queries/chat.queries';
import { GraphQLService } from 'src/graphql/service/graphql.service';
import { User } from 'src/user/entities/user.entity';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  private readonly graphqlService: GraphQLService;
  constructor(
    @Inject('APOLLO_CLIENT') private readonly apolloClient: ApolloClient<any>,
  ) {
    this.graphqlService = new GraphQLService(apolloClient);
  }

  @Post('/api')
  async createChat(
    @CurrentUser() user: TokenPayload,
    @Body('users') other: string,
  ) {
    // const cleanedData = removeTypename(data);

    const usersArray: User[] = JSON.parse(other);
    const chatInput = [...usersArray, user];
    const cleanedData = chatInput.map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { UserId, Username, ProfilePic, ...rest } = item;
      return { UserId, Username, ProfilePic };
    });
    try {
      const chat = await this.graphqlService.mutateData<any>(
        CREATE_CHAT_MUTATION,
        {
          createChatInput: cleanedData,
        },
      );
      return chat.createChat;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }

  @Get('/api')
  async getChat(@CurrentUser() user: TokenPayload) {
    try {
      const chats = await this.graphqlService.mutateData<any>(
        FIND_ALL_CHATS_QUERY,
        {
          UserId: user.UserId,
        },
      );
      return chats.findAllChats;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }
}
