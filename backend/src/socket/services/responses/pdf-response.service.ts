import { Injectable } from '@nestjs/common'
import { SaveMinioService } from '../save-minio.service'

@Injectable()
export class PdfResponseService {
  constructor(private readonly saveMinioService: SaveMinioService) {}

  async generate(content: string, roomId: string): Promise<string> {
    console.log(`[${new Date().toISOString()}] [PdfResponseService] generate() called`)
    try {
      const PDFDocument = require('pdfkit')
      const fs = require('fs')
      const path = require('path')
      const filename = `response_${Date.now()}.pdf`
      const tempPath = path.join('/tmp', filename)
      const doc = new PDFDocument()
      const stream = fs.createWriteStream(tempPath)
      doc.pipe(stream)
      doc.fontSize(12).text(content, 100, 100)
      doc.end()
      await new Promise((resolve) => stream.on('finish', resolve))
      const fileBuffer = fs.readFileSync(tempPath)
      const base64Data = fileBuffer.toString('base64')
      const fileUrl = await this.saveMinioService.saveFile(
        {
          filename,
          mimeType: 'application/pdf',
          data: base64Data,
          size: fileBuffer.length,
        },
        roomId,
      )
      fs.unlinkSync(tempPath)
      return fileUrl
    } catch (error) {
      console.error('Error generating PDF:', error)
      return content
    }
  }
}
