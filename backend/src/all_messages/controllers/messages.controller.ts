import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { MessagesService } from '../services/messages.service'
import { GetMessagesQueryDto, GetUserRoomsQueryDto } from '../dto/messages.dto'
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
    return this.messagesService.getMessagesByUserId(body);
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
    return this.messagesService.getRoomsByUserId(body);
  }

  @Get(':id')
  async getMessageById(@Param('id') id: string) {
    return this.messagesService.getMessageById(id)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteMessage(@Param('id') id: string, @Query('userId') userId: string) {
    return this.messagesService.deleteMessage(id, userId)
  }
}
