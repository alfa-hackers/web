import { Injectable, Logger } from '@nestjs/common'
import { MultipartFile } from '@fastify/multipart'
import { createWriteStream, promises as fsPromises } from 'fs'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { FileValidationService } from './file-validation.service'
import {
  DirectoryCreationResult,
  FileProcessingContext,
  FileUploadResult,
  ProcessedFile,
} from '../interfaces'
import { DirectoryCreationError, FileSaveError } from '../errors'

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name)

  constructor(private readonly fileValidationService: FileValidationService) {}

  async processFile(file: MultipartFile, context: FileProcessingContext): Promise<ProcessedFile> {
    this.fileValidationService.validateFile(file)

    const fileExtension = path.extname(file.filename).toLowerCase()
    const subFolder = this.fileValidationService.getSubFolder(fileExtension)
    const fileName = this.generateFileName(fileExtension)

    const uploadDir = path.join(
      process.cwd(),
      'static',
      subFolder,
      context.userId,
      context.userCardId,
    )
    const uploadPath = path.join(uploadDir, fileName)

    await this.ensureDirectoryExists(uploadDir)
    await this.saveFile(file, uploadPath)

    return {
      file,
      uploadPath,
    }
  }

  private generateFileName(extension: string): string {
    const fileUuid = uuidv4()
    return `${fileUuid}${extension}`
  }

  private async ensureDirectoryExists(dirPath: string): Promise<DirectoryCreationResult> {
    try {
      await fsPromises.mkdir(dirPath, { recursive: true })
      return {
        success: true,
        path: dirPath,
      }
    } catch (error) {
      this.logger.error(`❌ Error creating directory ${dirPath}:`, error)
      throw new DirectoryCreationError(dirPath, error as Error)
    }
  }

  private async saveFile(file: MultipartFile, uploadPath: string): Promise<FileUploadResult> {
    return new Promise<FileUploadResult>((resolve, reject) => {
      const fileStream = createWriteStream(uploadPath)
      const fileName = path.basename(uploadPath)

      file.file.pipe(fileStream)

      fileStream.on('open', () => this.logger.log(`🟡 Starting file write: ${uploadPath}`))

      fileStream.on('finish', () => {
        this.logger.log(`🟢 File uploaded successfully: ${uploadPath}`)
        resolve({
          success: true,
          filePath: uploadPath,
          fileName,
        })
      })

      fileStream.on('error', (err) => {
        this.logger.error('❌ Error writing file:', err)
        reject(new FileSaveError(uploadPath, err))
      })
    })
  }
}
