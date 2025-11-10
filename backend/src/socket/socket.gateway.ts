import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ClientManagerService } from 'socket/client-manager.service'
import { AIService } from 'socket/ai.service'
import { User } from 'domain/user.entity'
import { JoinRoomPayload, SendMessagePayload } from 'socket/socket.interface'
import { RoomService } from 'socket/services/room.service'
import { MessageService } from 'socket/services/message.service'

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  constructor(
    private readonly clientManager: ClientManagerService,
    private readonly aiService: AIService,
    private readonly roomService: RoomService,
    private readonly messageService: MessageService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async handleConnection(socket: Socket) {
    const { user, userTempId } = await this.roomService.handleConnection(
      socket,
      this.userRepository,
    )

    const userId = await this.clientManager.createUser(socket.id)
    socket.data.userTempId = userTempId
    socket.data.dbUserId = user.id

    socket.emit('connected', { socketId: socket.id, userId, userTempId })
  }

  async handleDisconnect(socket: Socket) {
    const userId = await this.clientManager.getUserBySocketId(socket.id)
    if (userId) {
      await this.roomService.broadcastDisconnection(userId, this.clientManager, this.server)
      await this.clientManager.removeUser(userId)
      await this.clientManager.removeSocketMapping(socket.id)
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@MessageBody() payload: JoinRoomPayload, @ConnectedSocket() socket: Socket) {
    return this.roomService.joinRoom(payload, socket, this.clientManager, this.server)
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() payload: JoinRoomPayload,
    @ConnectedSocket() socket: Socket,
  ) {
    return this.roomService.leaveRoom(payload, socket, this.clientManager, this.server)
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() payload: SendMessagePayload,
    @ConnectedSocket() socket: Socket,
  ) {
    return this.messageService.handleMessage(
      payload,
      socket,
      this.clientManager,
      this.server,
      this.aiService,
    )
  }
}
