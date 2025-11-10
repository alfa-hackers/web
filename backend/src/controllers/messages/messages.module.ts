import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MessagesController } from 'controllers/messages/messages.controller'
import { MessagesService } from 'controllers/messages/services/messages.service'
import { Message } from 'domain/message.entity'
import { Room } from 'domain/room.entity'
import { User } from 'domain/user.entity'
import { UserRoom } from 'domain/user-room.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Message, Room, User, UserRoom])],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
