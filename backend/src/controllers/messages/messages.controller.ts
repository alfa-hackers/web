import { Controller, Get, Post, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common'
import { MessagesService } from 'controllers/messages/services/messages.service'
<<<<<<< HEAD
import { GetUserMessagesDto, GetRoomMessagesDto } from 'controllers/messages/dto/messages.dto'
=======
import { GetMessagesQueryDto, GetRoomMessagesDto, GetUserRoomsQueryDto } from 'controllers/messages/dto/messages.dto'
>>>>>>> cc761e0 (chore: renamed all modules paths)
import { ApiBody } from '@nestjs/swagger'

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('/by-user')
  @ApiBody({
    description: 'Запрос сообщений пользователя',
    type: GetUserMessagesDto,
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
  async getUserMessages(@Body() body: GetUserMessagesDto) {
    return this.messagesService.getMessagesByUserId(body)
  }

  @Post('/by-room')
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

  @Get('/:id')
  async getMessageById(@Param('id') id: string) {
    return this.messagesService.getMessageById(id)
  }
}
