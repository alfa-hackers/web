import { Injectable } from '@nestjs/common'
import { FileAttachment } from '../../socket.interface'
const pdfParse = require('pdf-parse')

@Injectable()
export class PdfProcessService {
  async process(attachment: FileAttachment): Promise<string> {
    try {
      const buffer = Buffer.from(attachment.data, 'base64')
      const data = await pdfParse(buffer)

      let result = `File: ${attachment.filename}\n`
      result += `Pages: ${data.numpages}\n\n`
      result += data.text.trim()

      return result
    } catch (error) {
      throw new Error(`Failed to process PDF file: ${error.message}`)
    }
  }
}
