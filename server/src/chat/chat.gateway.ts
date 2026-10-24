import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  namespace: 'chat',
  cors: { origin: 'http://localhost:5173', credentials: true },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  @SubscribeMessage('messages:get')
  async handleGetMessages(@ConnectedSocket() client: Socket) {
    const messages = await this.chatService.getMessages();
    client.emit('messages', messages);
  }

  @SubscribeMessage('message:post')
  async handlePostMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; userName: string; text: string },
  ) {
    const message = await this.chatService.createMessage(
      data.userId,
      data.userName,
      data.text,
    );
    this.server.emit('message:new', message);
  }

  @SubscribeMessage('message:put')
  async handlePutMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { id: number; userId: string; text: string },
  ) {
    const message = await this.chatService.updateMessage(data.id, data.userId, data.text);
    this.server.emit('message:updated', message);
  }

  @SubscribeMessage('message:delete')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { id: number; userId: string },
  ) {
    await this.chatService.deleteMessage(data.id, data.userId);
    this.server.emit('message:deleted', { id: data.id });
  }

  @SubscribeMessage('messages:clear')
  async handleClearMessages() {
    await this.chatService.clearMessages();
    this.server.emit('messages:cleared');
  }
}
