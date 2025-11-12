import { Controller, Get, Post, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common'
import { RoomsService } from 'controllers/rooms/services/rooms.service'
import { GetUserRoomsDto } from 'controllers/rooms/dto/rooms.dto'
import { ApiBody } from '@nestjs/swagger'

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

<<<<<<< HEAD
  @Post('/by-user')
=======
  @Post('/')
>>>>>>> 64aa15d (fix: changed API for easier work)
  @ApiBody({
    description: 'Запрос комнат пользователя',
    type: GetUserRoomsDto,
    examples: {
      example1: {
        summary: 'Пример запроса комнат',
        value: {
          userId: '15f29d79-e862-4250-bebf-75f7a0ab69db',
        },
      },
    },
  })
  async getUserRooms(@Body() body: GetUserRoomsDto) {
    return this.roomsService.getRoomsByUserId(body)
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  async deleteRoom(@Param('id') id: string) {
    return this.roomsService.deleteRoom(id)
  }
}
