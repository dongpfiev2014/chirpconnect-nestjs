import { UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
// import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { WebsocketExceptionFilter } from './ws-exception.filter';
import { Server, Socket } from 'socket.io';
import { TokenPayload } from 'src/auth/token-payload.interface';
import { Message } from 'src/message/entities/message.entity';

// class Message {
//   @IsNotEmpty()
//   @IsUUID()
//   MessageId: string;

//   @IsNotEmpty()
//   @IsString()
//   Content: string;
// }

@WebSocketGateway({
  cors: {
    origin: 'http://chirpconnect.ap-southeast-2.elasticbeanstalk.com',
    credentials: true,
  },
})
@UseFilters(new WebsocketExceptionFilter())
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    //client.broadcast.emit ensures that every other client in the same namespace, or the same room (if you use rooms), receives the event except this client.
    client.broadcast.emit('connected', {
      message: `User has connected with ${client.id}`,
    });

    //this.server.emit will emit the event to all clients connected to the server without excluding anyone, including the current client.
    // this.server.emit('user-joined', {
    //   message: `User joined the chat with ${client.id}`,
    // });
    // client.to('roomName').emit('');
  }

  handleDisconnect(client: Socket) {
    console.log('User disconnected..', client.id);
    this.server.emit('disconnected', {
      message: `User disconnected from ${client.id}`,
    });
  }

  @SubscribeMessage('setup')
  handleSetup(
    @MessageBody() userData: TokenPayload,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(userData.UserId);
    client.emit('connected');
  }

  @SubscribeMessage('join room')
  handleJoinRoom(@MessageBody() room, @ConnectedSocket() client: Socket) {
    console.log(`Client ${client.id} joined room ${room}`);
    client.join(room);
  }

  @SubscribeMessage('typing')
  handleTyping(@MessageBody() room, @ConnectedSocket() client: Socket) {
    client.in(room).emit('typing');
  }

  @SubscribeMessage('stop typing')
  handleStopTyping(@MessageBody() room, @ConnectedSocket() client: Socket) {
    client.in(room).emit('stop typing');
  }

  @SubscribeMessage('new message')
  // @UsePipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //   }),
  // )
  handleMessage(
    @MessageBody() newMessage: Message,
    @ConnectedSocket() client: Socket,
  ) {
    const chat = newMessage.Chat;
    if (!chat.Users) {
      return console.log('Chat.Users not defined');
    }
    chat.Users.forEach((user) => {
      if (user.UserId == newMessage.Sender.UserId) return;
      client.in(user.UserId).emit('message received', newMessage);
    });
  }

  @SubscribeMessage('notification received')
  getLatestNotification(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.in(userId).emit('notification received');
  }
}
