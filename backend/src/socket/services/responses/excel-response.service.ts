import { Injectable } from '@nestjs/common'
import { SaveMinioService } from '../save-minio.service'
import * as ExcelJS from 'exceljs'

@Injectable()
export class ExcelResponseService {
  constructor(private readonly saveMinioService: SaveMinioService) {}

  private extractCsvData(content: string): string[][] {
    const lines = content.split('\n')
    const csvData: string[][] = []

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue
      if (this.isCsvLike(trimmedLine)) {
        const delimiter = this.detectDelimiter(trimmedLine)
        const cells = this.parseCsvLine(trimmedLine, delimiter)
        csvData.push(cells)
      }
    }

    return csvData
  }

  private isCsvLike(line: string): boolean {
    const hasDelimiters = /[,;\t|]/.test(line)
    const isNotPlainText =
      !/^[-*•]\s/.test(line) && !/^(Here|This|The|In|For|Note|Example)/i.test(line)

    return hasDelimiters && isNotPlainText
  }

  private detectDelimiter(line: string): string {
    const delimiters = [',', ';', '\t', '|']
    let maxCount = 0
    let detectedDelimiter = ','

    for (const delimiter of delimiters) {
      const count = (line.match(new RegExp(`\\${delimiter}`, 'g')) || []).length
      if (count > maxCount) {
        maxCount = count
        detectedDelimiter = delimiter
      }
    }

    return detectedDelimiter
  }

  private parseCsvLine(line: string, delimiter: string): string[] {
    const cells: string[] = []
    let currentCell = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === delimiter && !inQuotes) {
        cells.push(currentCell.trim())
        currentCell = ''
      } else {
        currentCell += char
      }
    }

    cells.push(currentCell.trim())
    return cells
  }

  async generate(content: string, roomId: string): Promise<string> {
    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('AI Response')

      const csvData = this.extractCsvData(content)

      if (csvData.length === 0) {
        worksheet.getCell('A1').value = 'No structured data found'
      } else {
        csvData.forEach((row, rowIndex) => {
          row.forEach((cell, colIndex) => {
            worksheet.getCell(rowIndex + 1, colIndex + 1).value = cell
          })
        })

        worksheet.columns.forEach((column) => {
          let maxLength = 10
          column.eachCell({ includeEmpty: false }, (cell) => {
            const cellLength = cell.value ? cell.value.toString().length : 0
            maxLength = Math.max(maxLength, cellLength)
          })
          column.width = Math.min(maxLength + 2, 50)
        })
      }

      const arrayBuffer = await workbook.xlsx.writeBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const filename = `response_${Date.now()}.xlsx`

      const fileUrl = await this.saveMinioService.saveFile(
        {
          filename,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          data: buffer.toString('base64'),
          size: buffer.byteLength,
        },
        roomId,
      )

      return fileUrl
    } catch (error) {
      throw new Error(`Failed to generate Excel file: ${error}`)
    }
  }
}
