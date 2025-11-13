import { Controller, Post, Delete, Param, HttpCode, HttpStatus, Req } from '@nestjs/common'
import { RoomsService } from 'controllers/rooms/services/rooms.service'
import { FastifyRequest } from 'fastify'

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('/by-user')
  async getUserRooms(@Req() request: FastifyRequest) {
    return this.roomsService.getRoomsByUserId(request)
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  async deleteRoom(@Param('id') id: string) {
    return this.roomsService.deleteRoom(id)
  }
}
