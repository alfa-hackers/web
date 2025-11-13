import { Injectable } from '@nestjs/common'
import pptxgen from 'pptxgenjs'
import { SaveMinioService } from '../save-minio.service'

@Injectable()
export class PowerpointResponseService {
  constructor(private readonly saveMinioService: SaveMinioService) {}

  async generate(content: string, roomId: string): Promise<string> {
    try {
      const pptx = new pptxgen()

      const slides = content.split('\n\n')

      slides.forEach((slideContent) => {
        const slide = pptx.addSlide()
        slide.addText(slideContent, {
          x: 0.5,
          y: 0.5,
          w: 9,
          h: 5,
          fontSize: 18,
          color: '363636',
        })
      })

      const buffer = (await pptx.write({ outputType: 'nodebuffer' })) as Buffer
      const base64Data = buffer.toString('base64')

      const filename = `response_${Date.now()}.pptx`

      const fileUrl = await this.saveMinioService.saveFile(
        {
          filename,
          mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
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
