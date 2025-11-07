import { Injectable, Logger } from '@nestjs/common'
import { FastifyRequest } from 'fastify'
import { MultipartFile } from '@fastify/multipart'
import { FileUploadService } from './file-upload.service'
import { ProcessedFile, UploadResult } from '../interfaces'
import {
  InvalidMultipartRequestError,
  MissingUserCardIdError,
  NoFilesUploadedError,
} from '../errors'

@Injectable()
export class MultipartProcessorService {
  private readonly logger = new Logger(MultipartProcessorService.name)

  constructor(private readonly fileUploadService: FileUploadService) {}

  async processMultipartRequest(request: FastifyRequest): Promise<UploadResult> {
    await this.validateMultipartRequest(request)

    const uploadedFiles: MultipartFile[] = []
    const uploadPaths: string[] = []
    let userCardId: string | null = null
    let partNumber = 1

    this.logger.log('✅ Multipart request detected, processing parts')

    for await (const part of request.parts()) {
      this.logger.log(`📌 Processing part #${partNumber}: ${part.fieldname}, type: ${part.type}`)

      if (part.type === 'file' && part.fieldname === 'file') {
        const processedFile = await this.processFilePart(part, request)
        uploadedFiles.push(processedFile.file)
        uploadPaths.push(processedFile.uploadPath)
      }

      if (part.type === 'field' && part.fieldname === 'userCardId') {
        userCardId = part.value as string
        this.logger.log(`✅ Received userCardId: ${userCardId}`)
      }

      partNumber++
    }

    await this.validateProcessingResults(uploadedFiles, userCardId, request)

    return {
      uploadedFiles,
      uploadPaths,
      userCardId: userCardId || request.session.user_card_id,
    }
  }

  private validateMultipartRequest(request: FastifyRequest): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!request.isMultipart()) {
        reject(new InvalidMultipartRequestError())
      } else {
        resolve()
      }
    })
  }

  private async processFilePart(
    part: MultipartFile,
    request: FastifyRequest,
  ): Promise<ProcessedFile> {
    const userId = request.session?.user?.user_id
    const userCardId = request.session.user_card_id

    return await this.fileUploadService.processFile(part, {
      userId,
      userCardId,
      uploadDir: '',
    })
  }

  private validateProcessingResults(
    uploadedFiles: MultipartFile[],
    userCardId: string | null,
    request: FastifyRequest,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (uploadedFiles.length === 0) {
        this.logger.error('❌ Error: No files uploaded')
        reject(new NoFilesUploadedError())
        return
      }

      const finalUserCardId = userCardId || request.session.user_card_id
      if (!finalUserCardId) {
        this.logger.error('❌ Error: userCardId not specified')
        reject(new MissingUserCardIdError())
        return
      }

      resolve()
    })
  }
}
