import { Injectable } from '@nestjs/common'
import { Socket } from 'socket.io'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Message } from 'domain/message.entity'
import { ClientManagerService } from '../client-manager.service'
import { AIService } from '../ai.service'
import { SendMessagePayload, FileAttachment } from '../socket.interface'
import { LoadContextService } from './load-context.service'
import { SaveMinioService } from './save-minio.service'

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly loadContextService: LoadContextService,
    private readonly saveMinioService: SaveMinioService,
  ) {}

  async handleMessage(
    payload: SendMessagePayload,
    socket: Socket,
    clientManager: ClientManagerService,
    server,
    aiService: AIService,
  ) {
    const { roomId, message, attachments, messageFlag = 'text' } = payload
    const userId = clientManager.getUserBySocketId(socket.id)
    const { userTempId, dbUserId } = socket.data

    if (!userId) return { success: false, error: 'User not identified' }
    if (!socket.rooms.has(roomId)) return { success: false, error: 'You must join the room first' }

    let processedContent = message
    let fileUrl: string | null = null

    if (attachments?.length) {
      for (const attachment of attachments) {
        let extractedText = ''
        switch (attachment.mimeType) {
          case 'application/pdf':
            extractedText = await this.processPdf(attachment)
            break
          case 'application/msword':
            extractedText = await this.processDoc(attachment)
            break
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            extractedText = await this.processDocx(attachment)
            break
          case 'application/vnd.ms-excel':
          case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          case 'application/vnd.oasis.opendocument.spreadsheet':
            extractedText = await this.processExcel(attachment)
            break
        }
        const savedFileUrl = await this.saveMinioService.saveFile(attachment, roomId)
        if (savedFileUrl) fileUrl = savedFileUrl
        if (extractedText) processedContent += `\n\n${extractedText}`
      }
    }

    server.to(roomId).emit('message', { userId, message })

    await this.messageRepository.save({
      text: message,
      roomId,
      userTempId,
      userId: dbUserId,
      isAi: false,
      messageType: 'user',
      file_address: fileUrl,
      file_name: attachments?.length ? attachments[0].filename : null,
    })

    try {
      const combinedMessages = await this.loadContextService.loadContext(roomId, processedContent)
      const aiResponse = await aiService.generateResponse(combinedMessages)

      let formattedResponse: string
      let responseFileUrl: string | null = null

      switch (messageFlag) {
        case 'pdf':
          formattedResponse = await this.responsePdf(aiResponse.content, roomId)
          responseFileUrl = formattedResponse
          break
        case 'word':
          formattedResponse = await this.responseWord(aiResponse.content, roomId)
          responseFileUrl = formattedResponse
          break
        case 'excel':
          formattedResponse = await this.responseExcel(aiResponse.content, roomId)
          responseFileUrl = formattedResponse
          break
        case 'text':
        default:
          formattedResponse = await this.responseText(aiResponse.content)
          break
      }

      server.to(roomId).emit('message', {
        userId: 'assistant',
        message: formattedResponse,
        fileUrl: responseFileUrl,
        responseType: messageFlag,
      })

      await this.messageRepository.save({
        text: aiResponse.content,
        roomId,
        userTempId,
        userId: dbUserId,
        isAi: true,
        messageType: 'assistant',
        file_address: responseFileUrl,
        response_type: messageFlag,
      })

      return { success: true, responseType: messageFlag, fileUrl: responseFileUrl }
    } catch (error) {
      server.to(roomId).emit('message', { userId: 'system', message: `AI Error: ${error.message}` })
      return { success: false, error: error.message }
    }
  }

  private async processPdf(attachment: FileAttachment): Promise<string> {
    return `[PDF content: ${attachment.filename}]`
  }

  private async processDoc(attachment: FileAttachment): Promise<string> {
    return `[DOC content: ${attachment.filename}]`
  }

  private async processDocx(attachment: FileAttachment): Promise<string> {
    return `[DOCX content: ${attachment.filename}]`
  }

  private async processExcel(attachment: FileAttachment): Promise<string> {
    return `[Excel content: ${attachment.filename}]`
  }

  private async responseText(content: string): Promise<string> {
    console.log(`[${new Date().toISOString()}] [MessageService] responseText() called`)
    console.log(`[${new Date().toISOString()}] [MessageService] responseText() called`)
    return content
  }

  private async responsePdf(content: string, roomId: string): Promise<string> {
    console.log(`[${new Date().toISOString()}] [MessageService] responsePdf() called`)
    console.log(`[${new Date().toISOString()}] [MessageService] responsePdf() called`)
    console.log(`[${new Date().toISOString()}] [MessageService] responsePdf() called`)
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

  private async responseWord(content: string, roomId: string): Promise<string> {
    console.log(`[${new Date().toISOString()}] [MessageService] responseWord() called`)
    console.log(`[${new Date().toISOString()}] [MessageService] responseWord() called`)
    console.log(`[${new Date().toISOString()}] [MessageService] responseWord() called`)
    try {
      const { Document, Packer, Paragraph, TextRun } = require('docx')
      const fs = require('fs')
      const path = require('path')
      const filename = `response_${Date.now()}.docx`
      const tempPath = path.join('/tmp', filename)
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [new Paragraph({ children: [new TextRun(content)] })],
          },
        ],
      })
      const buffer = await Packer.toBuffer(doc)
      fs.writeFileSync(tempPath, buffer)
      const base64Data = buffer.toString('base64')
      const fileUrl = await this.saveMinioService.saveFile(
        {
          filename,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          data: base64Data,
          size: buffer.length,
        },
        roomId,
      )
      fs.unlinkSync(tempPath)
      return fileUrl
    } catch (error) {
      console.error('Error generating Word document:', error)
      return content
    }
  }

  private async responseExcel(content: string, roomId: string): Promise<string> {
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
