import { Injectable } from '@nestjs/common';
import { CreateChatInput } from './dto/create-chat.input';
import { UpdateChatInput } from './dto/update-chat.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}
  async create(createChatInput: CreateChatInput[]) {
    const newChat = this.chatRepository.create({
      IsGroupChat: true,
      Users: createChatInput.map((input) => ({
        UserId: input.UserId,
      })),
    });
    const result = await this.chatRepository.save(newChat);
    return result;
  }

  async findAll(UserId: string, unreadOnly: boolean) {
    const chats = await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.Users', 'user')
      .leftJoinAndSelect('chat.LatestMessage', 'message')
      .leftJoinAndSelect('message.Sender', 'sender')
      .leftJoinAndSelect('message.ReadBy', 'readBy')
      // .where(
      //   'chat.ChatId IN (SELECT ChatId FROM Chat_User WHERE UserId = :UserId)',
      //   { UserId },
      // )
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('uc.ChatId')
          .from('Chat_User', 'uc')
          .where('uc.UserId = :UserId')
          .getQuery();
        return `chat.ChatId IN (${subQuery})`;
      })
      .setParameter('UserId', UserId)
      .orderBy('chat.CreatedAt', 'DESC')
      .getMany();

    if (unreadOnly !== undefined && unreadOnly !== null && unreadOnly) {
      const readOnlyChats = chats.filter(
        (chat) =>
          chat.LatestMessage &&
          !chat.LatestMessage.ReadBy.some(
            (message) => message.UserId == UserId,
          ),
      );

      return readOnlyChats;
    }

    return chats;
  }

  async findOne(UserId: string, ChatId: string) {
    const chat = await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.Users', 'user')
      .where('chat.ChatId = :ChatId', { ChatId })
      .andWhere(
        'chat.ChatId IN (SELECT ChatId FROM Chat_User WHERE UserId = :UserId)',
        { UserId },
      )
      .getOne();
    if (chat === null) {
      const userFound = await this.userRepository.findOne({
        where: { UserId: ChatId },
      });
      if (userFound !== null) {
        const singleChat = await this.getChatByUserId(UserId, userFound.UserId);
        return singleChat;
      }
    }
    return chat;
  }

  async getChatByUserId(userLoggedInId: string, otherUserId: string) {
    const chat = await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.Users', 'user')
      .where('chat.IsGroupChat = :IsGroupChat', { IsGroupChat: false })
      .andWhere(() => {
        return `chat.ChatId IN (
          SELECT ChatUser.ChatId 
          FROM Chat_User ChatUser 
          WHERE ChatUser.UserId IN (:...UserIds)
          GROUP BY ChatUser.ChatId 
          HAVING COUNT(ChatUser.ChatId) = 2
        )`;
      })
      .setParameter('UserIds', [userLoggedInId, otherUserId])
      .getOne();

    if (!chat) {
      const newChat = this.chatRepository.create({
        IsGroupChat: false,
        Users: [{ UserId: userLoggedInId }, { UserId: otherUserId }],
      });
      const savedChat = await this.chatRepository.save(newChat);

      const result = await this.chatRepository.findOne({
        where: { ChatId: savedChat.ChatId },
        relations: ['Users'],
      });

      return result;
    }

    return chat;
  }

  async update(updateChatInput: UpdateChatInput): Promise<Chat> {
    const chat = await this.chatRepository
      .createQueryBuilder()
      .update('chat')
      .set({
        ChatName: updateChatInput.ChatName,
      })
      .where('ChatId = :ChatId', { ChatId: updateChatInput.ChatId })
      .output('INSERTED.*')
      .execute();

    return chat.raw[0];
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
