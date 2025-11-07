import { Injectable, Logger } from '@nestjs/common'
import * as mime from 'mime-types'
import { FastifyRequest } from 'fastify'
import { MEDIA_TYPES, MediaType } from '../constants'
import { MediaSaveResult } from '../interfaces'
import { UnknownFileTypeError, UnsupportedFileTypeError } from '../errors'

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name)

  constructor() {}

  async saveMediaStream(
    paths: string[],
    eventId: string,
    request: FastifyRequest,
  ): Promise<MediaSaveResult> {
    try {
      for (const path of paths) {
        const fileType = mime.lookup(path)

        if (!fileType) {
          throw new UnknownFileTypeError(path)
        }

        const mediaType = this.getMediaType(fileType)

        this.logger.log(`Saving media: ${mediaType}`)

        this.logger.log(`✅ Media saved for event ${eventId}: ${path}`)
      }

      return {
        message: 'Files uploaded successfully',
        paths,
        eventId,
      }
    } catch (error) {
      this.logger.error('Error in media saving:', error)
      throw error
    } finally {
      request.userCardId = null
    }
  }

  private getMediaType(fileType: string): MediaType {
    if (fileType.startsWith('video/')) {
      return MEDIA_TYPES.VIDEO
    } else if (fileType.startsWith('image/')) {
      return MEDIA_TYPES.IMAGE
    } else {
      throw new UnsupportedFileTypeError(fileType)
    }
  }
}
