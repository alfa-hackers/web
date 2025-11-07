import { UploadErrorBase } from '../base/upload-error.base'

export abstract class MediaSaveError extends UploadErrorBase {
  abstract readonly code: string
  readonly statusCode = 500

  constructor(message: string, context?: Record<string, any>) {
    super(message, context)
  }
}

export class UnknownFileTypeError extends MediaSaveError {
  readonly code = 'UNKNOWN_FILE_TYPE'

  constructor(path: string) {
    super(`Could not determine file type for: ${path}`, { path })
  }
}

export class UnsupportedFileTypeError extends MediaSaveError {
  readonly code = 'UNSUPPORTED_FILE_TYPE'

  constructor(fileType: string) {
    super(`Unsupported file type: ${fileType}`, { fileType })
  }
}
