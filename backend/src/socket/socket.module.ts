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
import { MinioService } from 'minio/minio.service'
import { LoadContextService } from './services/load-context.service'
import { SaveMinioService } from './services/save-minio.service'
import { ExcelResponseService } from './services/responses/excel-response.service'
import { PdfResponseService } from './services/responses/pdf-response.service'
import { WordResponseService } from './services/responses/word-response.service'

@Module({
  imports: [TypeOrmModule.forFeature([User, Message, Room, UserRoom])],
  providers: [
    SocketGateway,
    ClientManagerService,
    AIService,
    RoomService,
    MessageService,
    MessagesService,
    MinioService,
    LoadContextService,
    SaveMinioService,
    ExcelResponseService,
    PdfResponseService,
    WordResponseService,
  ],
  exports: [ClientManagerService],
})
export class SocketModule {}
