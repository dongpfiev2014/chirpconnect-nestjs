import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageResolver } from './message.resolver';
import { MessageController } from './message.controller';

@Module({
  providers: [MessageResolver, MessageService],
  controllers: [MessageController],
})
export class MessageModule {}
