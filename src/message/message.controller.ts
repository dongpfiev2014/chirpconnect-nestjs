import { ApolloClient } from '@apollo/client/core';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Render,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TokenPayload } from 'src/auth/token-payload.interface';
import { FIND_ONE_CHAT_QUERY } from 'src/graphql/queries/chat.queries';
import { CREATE_MESSAGE_MUTATION } from 'src/graphql/queries/message.queries';
import { GraphQLService } from 'src/graphql/service/graphql.service';

@Controller('message')
@UseGuards(JwtAuthGuard)
export class MessageController {
  private readonly graphqlService: GraphQLService;
  constructor(
    @Inject('APOLLO_CLIENT') private readonly apolloClient: ApolloClient<any>,
  ) {
    this.graphqlService = new GraphQLService(apolloClient);
  }

  @Get('')
  @Render('inboxPage')
  async root(@CurrentUser() user: TokenPayload) {
    return {
      pageTitle: 'Inbox',
      userLoggedIn: user,
      userLoggedInJs: JSON.stringify(user),
    };
  }

  @Get('/new')
  @Render('newMessage')
  async newMessage(@CurrentUser() user: TokenPayload) {
    try {
      return {
        pageTitle: 'New Message',
        userLoggedIn: user,
        userLoggedInJs: JSON.stringify(user),
      };
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }

  @Get('/:ChatId')
  @Render('chatPage')
  async getMessage(
    @CurrentUser() user: TokenPayload,
    @Param('ChatId') ChatId: string,
  ) {
    try {
      const chat = await this.graphqlService.fetchData<any>(
        FIND_ONE_CHAT_QUERY,
        {
          UserId: user.UserId,
          ChatId,
        },
      );

      return {
        pageTitle: 'Chat',
        userLoggedIn: user,
        userLoggedInJs: JSON.stringify(user),
        chat: chat.findOneChat,
      };
    } catch (error) {
      return {
        errorMessage:
          'You are not authorized to access this page.' || error.message,
      };
    }
  }

  @Post('/api')
  async createMessage(
    @CurrentUser() user: TokenPayload,
    @Body() messageInput: { content: string; chatId: string },
  ) {
    try {
      const message = await this.graphqlService.mutateData<any>(
        CREATE_MESSAGE_MUTATION,
        {
          createMessageInput: {
            Content: messageInput.content,
            ChatId: messageInput.chatId,
            Sender: user.UserId,
          },
        },
      );
      return message.createMessage;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }
}
