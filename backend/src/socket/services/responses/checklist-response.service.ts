import { Injectable } from '@nestjs/common'
import { SaveMinioService } from '../save-minio.service'

@Injectable()
export class ChecklistResponseService {
  constructor(private readonly saveMinioService: SaveMinioService) {}

  async generate(content: string, roomId: string): Promise<string> {
    try {
      const lines = content.split('\n').filter((line) => line.trim())

      const items = lines.map((line) => {
        const trimmed = line.trim()
        const withoutNumber = trimmed.replace(/^\d+\.\s*/, '')
        return withoutNumber
      })

      const checklistText = items.map((item) => `☐ ${item}`).join('\n\n')

      const buffer = Buffer.from(checklistText, 'utf-8')
      const base64Data = buffer.toString('base64')

      const filename = `checklist_${Date.now()}.txt`

      const fileUrl = await this.saveMinioService.saveFile(
        {
          filename,
          mimeType: 'text/plain',
          data: base64Data,
          size: buffer.length,
        },
        roomId,
      )

      return fileUrl
    } catch (error) {
      throw error
    }
  }
}
