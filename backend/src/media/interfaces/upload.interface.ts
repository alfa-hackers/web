import { MultipartFile } from '@fastify/multipart'

export interface UploadResult {
  uploadedFiles: MultipartFile[]
  uploadPaths: string[]
  userCardId: string
}

export interface FileProcessingContext {
  userId: string
  userCardId: string
  uploadDir: string
}

export interface ProcessedFile {
  file: MultipartFile
  uploadPath: string
}
