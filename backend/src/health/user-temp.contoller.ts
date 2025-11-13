import { Controller, Get, Req } from '@nestjs/common'
import { Public } from 'common/decorators/public.decorator'
import { FastifyRequest } from 'fastify'

@Controller('user-temp')
export class UserTempController {
  @Public()
  @Get()
  async getUserTempId(@Req() req: FastifyRequest) {
    const session = req.session

    return { userTempId: session.user_temp_id }
  }
}
