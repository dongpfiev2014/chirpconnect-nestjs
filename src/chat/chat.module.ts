import { forwardRef, Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatResolver } from './chat.resolver';
import { ChatController } from './chat.controller';
import { Chat } from './entities/chat.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat]),
    UserModule,
    forwardRef(() => MessageModule),
  ],
  providers: [ChatResolver, ChatService],
  controllers: [ChatController],
  exports: [TypeOrmModule],
})
export class ChatModule {}
