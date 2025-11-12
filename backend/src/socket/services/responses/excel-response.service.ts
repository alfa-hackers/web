import { Injectable } from '@nestjs/common'
import { SaveMinioService } from '../save-minio.service'

@Injectable()
export class ExcelResponseService {
  constructor(private readonly saveMinioService: SaveMinioService) {}

  async generate(content: string, roomId: string): Promise<string> {
    console.log(`[${new Date().toISOString()}] [ExcelResponseService] generate() called`)
    try {
      const ExcelJS = require('exceljs')
      const fs = require('fs')
      const path = require('path')
      const filename = `response_${Date.now()}.xlsx`
      const tempPath = path.join('/tmp', filename)
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('AI Response')
      const lines = content.split('\n')
      lines.forEach((line, index) => {
        worksheet.getCell(`A${index + 1}`).value = line
      })
      worksheet.columns = [{ width: 80 }]
      await workbook.xlsx.writeFile(tempPath)
      const fileBuffer = fs.readFileSync(tempPath)
      const base64Data = fileBuffer.toString('base64')
      const fileUrl = await this.saveMinioService.saveFile(
        {
          filename,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          data: base64Data,
          size: fileBuffer.length,
        },
        roomId,
      )
      fs.unlinkSync(tempPath)
      return fileUrl
    } catch (error) {
      console.error('Error generating Excel:', error)
      return content
    }
  }
}
