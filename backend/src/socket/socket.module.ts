import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketGateway } from 'socket/socket.gateway';
import { ClientManagerService } from 'socket/client-manager.service';
import { AIService } from 'socket/ai.service';
import { RoomService } from 'socket/services/room.service';
import { MessageService } from 'socket/services/message.service';
import { User } from 'domain/user.entity';
import { Message } from 'domain/message.entity';
import { Room } from 'domain/room.entity';
import { UserRoom } from 'domain/user-room.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Message, Room, UserRoom])
  ],
  providers: [
    SocketGateway,
    ClientManagerService,
    AIService,
    RoomService,
    MessageService,
  ],
  exports: [ClientManagerService],
})
export class SocketModule {}
