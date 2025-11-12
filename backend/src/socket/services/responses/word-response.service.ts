import { Injectable } from '@nestjs/common'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { SaveMinioService } from '../save-minio.service'

@Injectable()
export class WordResponseService {
  constructor(private readonly saveMinioService: SaveMinioService) {}

  async generate(content: string, roomId: string): Promise<string> {
    console.log(`[${new Date().toISOString()}] [WordResponseService] generate() called`)

    try {
      const doc = new Document({
        sections: [
          {
            children: [new Paragraph({ children: [new TextRun(content)] })],
          },
        ],
      })

      const buffer = await Packer.toBuffer(doc)
      const base64Data = buffer.toString('base64')

      const filename = `response_${Date.now()}.docx`

      const fileUrl = await this.saveMinioService.saveFile(
        {
          filename,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          data: base64Data,
          size: buffer.length,
        },
        roomId,
      )

      console.log(`✅ Word document uploaded to MinIO: ${fileUrl}`)
      return fileUrl
    } catch (error) {
      console.error('❌ Error generating or uploading Word document:', error)
      throw error
    }
  }
}
