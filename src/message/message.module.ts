import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageResolver } from './message.resolver';
import { MessageController } from './message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), ChatModule],
  providers: [MessageResolver, MessageService],
  controllers: [MessageController],
})
export class MessageModule {}
