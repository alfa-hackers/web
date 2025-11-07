import { UploadErrorBase } from '../base/upload-error.base'

export abstract class FileUploadError extends UploadErrorBase {
  abstract readonly code: string
  readonly statusCode = 500

  constructor(message: string, context?: Record<string, any>) {
    super(message, context)
  }
}

export class DirectoryCreationError extends FileUploadError {
  readonly code = 'DIRECTORY_CREATION_ERROR'

  constructor(path: string, originalError: Error) {
    super(`Failed to create upload directory: ${path}`, {
      path,
      originalError: originalError.message,
    })
  }
}

export class FileSaveError extends FileUploadError {
  readonly code = 'FILE_SAVE_ERROR'

  constructor(path: string, originalError: Error) {
    super(`Error uploading file: ${path}`, {
      path,
      originalError: originalError.message,
    })
  }
}
