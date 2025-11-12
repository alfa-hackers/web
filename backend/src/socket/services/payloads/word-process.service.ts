import { Injectable } from '@nestjs/common'
import { FileAttachment } from '../../socket.interface'

@Injectable()
export class WordProcessService {
  async processDoc(attachment: FileAttachment): Promise<string> {
    return `[DOC content: ${attachment.filename}]`
  }

  async processDocx(attachment: FileAttachment): Promise<string> {
    return `[DOCX content: ${attachment.filename}]`
  }
}
