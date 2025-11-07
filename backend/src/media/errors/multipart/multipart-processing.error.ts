import { UploadErrorBase } from '../base/upload-error.base'

export abstract class MultipartProcessingError extends UploadErrorBase {
  abstract readonly code: string
  readonly statusCode = 400

  constructor(message: string, context?: Record<string, any>) {
    super(message, context)
  }
}

export class InvalidMultipartRequestError extends MultipartProcessingError {
  readonly code = 'INVALID_MULTIPART_REQUEST'

  constructor() {
    super('Request is not multipart')
  }
}

export class NoFilesUploadedError extends MultipartProcessingError {
  readonly code = 'NO_FILES_UPLOADED'

  constructor() {
    super('No files uploaded')
  }
}

export class MissingUserCardIdError extends MultipartProcessingError {
  readonly code = 'MISSING_USER_CARD_ID'

  constructor() {
    super('userCardId not specified')
  }
}
