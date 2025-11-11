import { Injectable } from '@nestjs/common'
import { Socket } from 'socket.io'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Message } from 'domain/message.entity'
import { ClientManagerService } from '../client-manager.service'
import { AIService } from '../ai.service'
import { SendMessagePayload, FileAttachment } from '../socket.interface'
import { MessagesService } from 'controllers/messages/services/messages.service'
import { MinioService } from 'minio/minio.service'
import { v4 as uuidv4 } from 'uuid'
import { LoadContextService } from './load-context.service'

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly messagesService: MessagesService,
    private readonly minioService: MinioService,
    private readonly loadContextService: LoadContextService,
  ) {}

  async handleMessage(
    payload: SendMessagePayload,
    socket: Socket,
    clientManager: ClientManagerService,
    server,
    aiService: AIService,
  ) {
    const { roomId, message, attachments } = payload
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
        }

        const savedFileUrl = await this.saveToMinio(attachment, roomId)
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

      server.to(roomId).emit('message', { userId: 'assistant', message: aiResponse.content })

      await this.messageRepository.save({
        text: aiResponse.content,
        roomId,
        userTempId,
        userId: dbUserId,
        isAi: true,
        messageType: 'assistant',
      })

      return { success: true }
    } catch (error) {
      server.to(roomId).emit('message', { userId: 'system', message: `AI Error: ${error.message}` })
      return { success: false, error: error.message }
    }
  }

  private async saveToMinio(attachment: FileAttachment, roomId: string): Promise<string> {
    const bucketName = process.env.MINIO_BUCKET_NAME || 'chat-files'
    const fileExtension = attachment.filename.split('.').pop()
    const uniqueFileName = `${roomId}/${uuidv4()}.${fileExtension}`
    const fileBuffer = Buffer.from(attachment.data, 'base64')
    const filePath = await this.minioService.uploadFile(
      bucketName,
      uniqueFileName,
      fileBuffer,
      attachment.mimeType,
    )

    const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http'
    const minioEndpoint = process.env.MINIO_ENDPOINT
    const minioPort = process.env.MINIO_PORT

    return `${protocol}://${minioEndpoint}:${minioPort}/${filePath}`
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
}
