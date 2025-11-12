import { Injectable } from '@nestjs/common'
import { Socket } from 'socket.io'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Message } from 'domain/message.entity'
import { ClientManagerService } from '../client-manager.service'
import { AIService } from '../ai.service'
import { SendMessagePayload } from '../socket.interface'
import { LoadContextService } from './load-context.service'
import { SaveMinioService } from './save-minio.service'
import { PdfResponseService } from './responses/pdf-response.service'
import { WordResponseService } from './responses/word-response.service'
import { ExcelResponseService } from './responses/excel-response.service'
import { PdfProcessService } from './payloads/pdf-process.service'
import { WordProcessService } from './payloads/word-process.service'
import { ExcelProcessService } from './payloads/excel-process.service'

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly loadContextService: LoadContextService,
    private readonly saveMinioService: SaveMinioService,
    private readonly pdfResponseService: PdfResponseService,
    private readonly wordResponseService: WordResponseService,
    private readonly excelResponseService: ExcelResponseService,
    private readonly pdfProcessService: PdfProcessService,
    private readonly wordProcessService: WordProcessService,
    private readonly excelProcessService: ExcelProcessService,
  ) {}

  async handleMessage(
    payload: SendMessagePayload,
    socket: Socket,
    clientManager: ClientManagerService,
    server,
    aiService: AIService,
  ) {
    const { roomId, message, attachments, messageFlag = 'text', temperature: customTemp } = payload
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
            extractedText = await this.pdfProcessService.process(attachment)
            break
          case 'application/msword':
            extractedText = await this.wordProcessService.processDoc(attachment)
            break
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            extractedText = await this.wordProcessService.processDocx(attachment)
            break
          case 'application/vnd.ms-excel':
          case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          case 'application/vnd.oasis.opendocument.spreadsheet':
            extractedText = await this.excelProcessService.process(attachment)
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
      const temperatureMap: Record<string, number> = {
        text: 1,
        pdf: 0.5,
        word: 0.6,
        excel: 0.2,
      }
      const temperature = customTemp ?? temperatureMap[messageFlag] ?? 0.7
      const aiResponse = await aiService.generateResponse(
        combinedMessages,
        temperature,
        messageFlag,
      )

      let formattedResponse: string
      let responseFileUrl: string | null = null

      switch (messageFlag) {
        case 'pdf':
          responseFileUrl = await this.pdfResponseService.generate(aiResponse.content, roomId)
          formattedResponse = aiResponse.content
          break
        case 'word':
          responseFileUrl = await this.wordResponseService.generate(aiResponse.content, roomId)
          formattedResponse = aiResponse.content
          break
        case 'excel':
          responseFileUrl = await this.excelResponseService.generate(aiResponse.content, roomId)
          formattedResponse = aiResponse.content
          break
        case 'text':
        default:
          formattedResponse = aiResponse.content
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
}
