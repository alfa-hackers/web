import { Module } from '@nestjs/common'
import { UploadFileInterceptor } from './interceptors/upload-file.interceptor'
import { FileUploadService, FileValidationService, MultipartProcessorService } from './service'

@Module({
  providers: [
    UploadFileInterceptor,
    FileValidationService,
    FileUploadService,
    MultipartProcessorService,
  ],
  exports: [UploadFileInterceptor],
})
export class MediaModule {}
