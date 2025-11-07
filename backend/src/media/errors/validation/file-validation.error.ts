import { UploadErrorBase } from '../base/upload-error.base'

export abstract class FileValidationError extends UploadErrorBase {
  abstract readonly code: string
  readonly statusCode = 400

  constructor(message: string, context?: Record<string, any>) {
    super(message, context)
  }
}

export class InvalidFileTypeError extends FileValidationError {
  readonly code = 'INVALID_FILE_TYPE'

  constructor(fileType: string, filename: string) {
    super(`Invalid file type: ${fileType}`, {
      fileType,
      filename,
      supportedTypes: 'images and videos only',
    })
  }
}
