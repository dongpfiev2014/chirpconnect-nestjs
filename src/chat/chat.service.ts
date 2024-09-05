import { Injectable } from '@nestjs/common';
import { CreateChatInput } from './dto/create-chat.input';
import { UpdateChatInput } from './dto/update-chat.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
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

  async findAll(UserId: string) {
    const chats = await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.Users', 'user')
      .leftJoinAndSelect('chat.LatestMessage', 'message')
      .where('user.UserId = :UserId', { UserId })
      .getMany();
    return chats;
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatInput: UpdateChatInput) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
