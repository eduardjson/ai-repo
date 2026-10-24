import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  handleConnection(client: Socket) {
    const token = this.extractToken(client);
    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token);
      client.data.user = payload;
    } catch {
      client.disconnect();
    }
  }

  emitMessageCreated(message: unknown) {
    this.server.emit('message:new', message);
  }

  emitMessageUpdated(message: unknown) {
    this.server.emit('message:updated', message);
  }

  emitMessageDeleted(id: number) {
    this.server.emit('message:deleted', { id });
  }

  private extractToken(client: Socket): string | null {
    const fromAuth = client.handshake.auth?.token;
    if (typeof fromAuth === 'string' && fromAuth.length > 0) {
      return fromAuth;
    }

    const fromHeader = client.handshake.headers?.authorization;
    if (typeof fromHeader === 'string' && fromHeader.startsWith('Bearer ')) {
      return fromHeader.slice(7);
    }

    return null;
  }
}
