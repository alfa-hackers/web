export abstract class UploadErrorBase extends Error {
  abstract readonly code: string
  abstract readonly statusCode: number
  readonly context?: Record<string, any>

  constructor(message: string, context?: Record<string, any>) {
    super(message)
    this.name = this.constructor.name
    this.context = context
  }
}
