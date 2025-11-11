import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SocketGateway } from './socket.gateway'
import { ClientManagerService } from './client-manager.service'
import { AIService } from './ai.service'
import { RoomService } from './services/room.service'
import { MessageService } from './services/message.service'
import { User } from 'src/domain/user.entity'
import { Message } from 'src/domain/message.entity'
import { Room } from 'src/domain/room.entity'
import { UserRoom } from 'src/domain/user-room.entity'
import { MessagesService } from 'src/all_messages/services/messages.service'

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
