import { Controller, Post, Req, UseInterceptors } from '@nestjs/common'
import { MediaService } from '../service'
import { FastifyRequest } from 'fastify'
import { UploadFileInterceptor } from '../interceptors/upload-file.interceptor'

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(UploadFileInterceptor)
  async uploadFile(@Req() request: FastifyRequest) {
    return this.mediaService.saveMediaStream(request.uploadPaths!, request.userCardId!, request)
  }
}
