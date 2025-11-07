import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { FastifyRequest } from 'fastify'
import { MultipartProcessorService } from '../service'
import { MultipartFile } from '@fastify/multipart'

declare module 'fastify' {
  interface FastifyRequest {
    uploadedFiles?: MultipartFile[]
    userCardId?: string
    uploadPaths?: string[]
  }
}

@Injectable()
export class UploadFileInterceptor implements NestInterceptor {
  private readonly logger = new Logger(UploadFileInterceptor.name)

  constructor(private readonly multipartProcessorService: MultipartProcessorService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<FastifyRequest>()

    this.logger.log('🟢 Starting file upload request processing')

    try {
      const result = await this.multipartProcessorService.processMultipartRequest(request)

      this.attachResultToRequest(request, result)

      this.logger.log('🟢 Request processing completed successfully, passing control forward')
      return next.handle()
    } catch (error) {
      this.logger.error(`❌ Error processing files: ${error.message}`)
      throw new BadRequestException(`Error processing files: ${error.message}`)
    }
  }

  private attachResultToRequest(request: FastifyRequest, result: any): void {
    request.uploadedFiles = result.uploadedFiles
    request.userCardId = result.userCardId
    request.uploadPaths = result.uploadPaths
  }
}
