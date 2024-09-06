import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { IsNotEmpty, IsString } from 'class-validator';
import { WebsocketExceptionFilter } from './ws-exception.filter';
import { Server, Socket } from 'socket.io';

class Message {
  @IsNotEmpty()
  @IsString()
  nickname: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3002',
    credentials: true,
  },
})
@UseFilters(new WebsocketExceptionFilter())
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('New user connected..', client.id);

    //client.broadcast.emit ensures that every other client in the same namespace, or the same room (if you use rooms), receives the event except this client.
    client.broadcast.emit('user-joined', {
      message: `User joined the chat with ${client.id}`,
    });

    //this.server.emit will emit the event to all clients connected to the server without excluding anyone, including the current client.
    // this.server.emit('user-joined', {
    //   message: `User joined the chat with ${client.id}`,
    // });
    // client.to('roomName').emit('');
  }

  handleDisconnect(client: Socket) {
    console.log('User disconnected..', client.id);
    this.server.emit('user-disconnected', {
      message: `User left the chat with ${client.id}`,
    });
  }

  @SubscribeMessage('newMessage')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  handleMessage(
    @MessageBody() message: Message,
    @ConnectedSocket() _client: Socket,
  ) {
    this.server.emit('message', message);
  }
}
