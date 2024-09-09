import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageResolver } from './message.resolver';
import { MessageController } from './message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { ChatModule } from 'src/chat/chat.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    ChatModule,
    NotificationModule,
  ],
  providers: [MessageResolver, MessageService],
  controllers: [MessageController],
  exports: [MessageService],
})
export class MessageModule {}
