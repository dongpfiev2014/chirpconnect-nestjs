import { Injectable } from '@nestjs/common';
import { CreateMessageInput } from './dto/create-message.input';
import { UpdateMessageInput } from './dto/update-message.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { Chat } from 'src/chat/entities/chat.entity';
import { NotificationService } from 'src/notification/notification.service';
import { TokenPayload } from 'src/auth/token-payload.interface';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message) private messageRepository: Repository<Message>,
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
    private notificationService: NotificationService,
  ) {}
  async create(createMessageInput: CreateMessageInput) {
    const message = await this.messageRepository.create({
      Chat: { ChatId: createMessageInput.ChatId },
      Content: createMessageInput.Content,
      Sender: { UserId: createMessageInput.Sender },
      ReadBy: [{ UserId: createMessageInput.Sender }],
    });

    const savedMessage = await this.messageRepository.save(message);
    const [result, _updatedChat] = await Promise.all([
      this.messageRepository.findOne({
        where: { MessageId: savedMessage.MessageId },
        relations: [
          'Sender',
          'Chat',
          'Chat.Users',
          'Chat.LatestMessage',
          'ReadBy',
        ],
      }),
      this.chatRepository
        .createQueryBuilder()
        .update('chat')
        .set({ LatestMessageId: savedMessage.MessageId })
        .where('chat.ChatId = :ChatId', { ChatId: createMessageInput.ChatId })
        .execute(),
    ]);
    const updatedChat = await this.chatRepository.findOne({
      where: { ChatId: createMessageInput.ChatId },
      relations: ['Users'],
    });
    this.insertNotifications(result, updatedChat);

    return result;
  }

  insertNotifications(message: Message, chat: Chat) {
    chat.Users.forEach((user) => {
      if (user.UserId === message.Sender.UserId) return;
      this.notificationService.insertNotification({
        UserToId: user.UserId,
        UserFromId: message.Sender.UserId,
        NotificationType: 'newMessage',
        EntityId: message.Chat.ChatId,
      });
    });
    return;
  }

  async findAll(ChatId: string) {
    const messages = await this.messageRepository.find({
      where: { Chat: { ChatId } },
      relations: ['Sender', 'Chat'],
      order: { CreatedAt: 'ASC' },
    });
    return messages;
  }

  async markAsReadMessages(user: TokenPayload, ChatId: string) {
    const latestMessage = await this.messageRepository.findOne({
      where: { Chat: { ChatId } },
      relations: ['ReadBy'],
      order: { CreatedAt: 'DESC' },
    });

    if (
      !latestMessage.ReadBy.some((readUser) => readUser.UserId === user.UserId)
    ) {
      latestMessage.ReadBy.push({ UserId: user.UserId } as User);
      await this.messageRepository.save(latestMessage);
    }

    return latestMessage;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, _updateMessageInput: UpdateMessageInput) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
