import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SocketGateway } from './socket.gateway'
import { ClientManagerService } from './client-manager.service'
import { AIService } from './ai.service'
import { RoomService } from './services/room.service'
import { MessageService } from './services/message.service'
import { User } from 'domain/user.entity'
import { Message } from 'domain/message.entity'
import { Room } from 'domain/room.entity'
import { UserRoom } from 'domain/user-room.entity'
import { MessagesService } from 'controllers/messages/services/messages.service'

@Module({
  imports: [TypeOrmModule.forFeature([User, Message, Room, UserRoom])],
  providers: [
    SocketGateway,
    ClientManagerService,
    AIService,
    RoomService,
    MessageService,
    MessagesService,
  ],
  exports: [ClientManagerService],
})
export class SocketModule {}
