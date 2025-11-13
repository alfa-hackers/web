import { Controller, Post, Delete, Param, HttpCode, HttpStatus, Req, Logger } from '@nestjs/common'
import { RoomsService } from 'controllers/rooms/services/rooms.service'
import { FastifyRequest } from 'fastify'
import { AuthService } from 'controllers/auth/services'

@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly authService: AuthService,
  ) {}

  @Post('/by-user')
  async getUserRooms(@Req() request: FastifyRequest) {
    try {
      let userId: string | null = null

      if (request.headers.cookie) {
        const currentUser = await this.authService.getCurrentUser(request)
        if (currentUser?.id) {
          userId = currentUser.id
        }
      }

      if (!userId) {
        userId = request.session?.user_temp_id || null
      }

      if (!userId) {
        return []
      }

      return this.roomsService.getRoomsByUserId(userId)
    } catch (error) {
      Logger.error('Error fetching user rooms', error)
      return []
    }
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  async deleteRoom(@Param('id') id: string) {
    return this.roomsService.deleteRoom(id)
  }
}
