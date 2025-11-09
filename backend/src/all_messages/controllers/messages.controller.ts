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
  UsePipes,
} from '@nestjs/common'
import { MessagesService } from '../services/messages.service'
import { GetMessagesQueryDto, GetUserRoomsQueryDto, CreateMessageDto } from '../dto/messages.dto'

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('all')
  async getMessages(@Body() body: GetMessagesQueryDto) {
    return this.messagesService.getMessagesByUserId(body);
  }

  @Post('rooms')
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
