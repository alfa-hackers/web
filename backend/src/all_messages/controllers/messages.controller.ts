import { Controller, Get, Post, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common'
import { MessagesService } from '../services/messages.service'
import { GetMessagesQueryDto, GetRoomMessagesDto, GetUserRoomsQueryDto } from '../dto/messages.dto'
import { ApiBody } from '@nestjs/swagger'

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('all')
  @ApiBody({
    description: 'Запрос сообщений пользователя',
    type: GetMessagesQueryDto,
    examples: {
      example1: {
        summary: 'Пример запроса сообщений',
        value: {
          userId: '15f29d79-e862-4250-bebf-75f7a0ab69db',
          roomId: 'room123',
          limit: 10,
        },
      },
    },
  })
  async getMessages(@Body() body: GetMessagesQueryDto) {
    return this.messagesService.getMessagesByUserId(body)
  }

  @Post('by-room')
  @ApiBody({
    description: 'Получение всех сообщений конкретной комнаты',
    type: GetRoomMessagesDto,
    examples: {
      example1: {
        summary: 'Запрос сообщений комнаты',
        value: {
          roomId: 'room123',
          limit: 20,
          offset: 0,
        },
      },
    },
  })
  async getRoomMessages(@Body() body: GetRoomMessagesDto) {
    return this.messagesService.getMessagesByRoomId(body)
  }

  @Post('rooms')
  @ApiBody({
    description: 'Запрос комнат пользователя',
    type: GetUserRoomsQueryDto,
    examples: {
      example1: {
        summary: 'Пример запроса комнат',
        value: {
          userId: '15f29d79-e862-4250-bebf-75f7a0ab69db',
        },
      },
    },
  })
  async getUserRooms(@Body() body: GetUserRoomsQueryDto) {
    return this.messagesService.getRoomsByUserId(body)
  }

  @Get(':id')
  async getMessageById(@Param('id') id: string) {
    return this.messagesService.getMessageById(id)
  }

  @Delete('room/:id')
  @HttpCode(HttpStatus.OK)
  async deleteRoom(@Param('id') id: string) {
    return this.messagesService.deleteRoom(id)
  }
}
