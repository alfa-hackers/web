import { Injectable } from '@nestjs/common'
import { MessagesService } from 'controllers/messages/services/messages.service'

@Injectable()
export class LoadContextService {
  constructor(private readonly messagesService: MessagesService) {}

  async loadContext(
    roomId: string,
    limit: number = 50,
  ): Promise<Array<{ role: string; content: string }>> {
    const result = await this.messagesService.getMessagesByRoomId({ roomId, limit, offset: 0 })
    return result.data.reverse().map((msg) => ({
      role: msg.messageType === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }))
  }
}
