import {
  getMessagesQuerySchema,
  getUserRoomsQuerySchema,
  createMessageSchema,
  GetMessagesQueryType,
  GetUserRoomsQueryType,
  CreateMessageType,
} from './messages.schema'

export class GetMessagesQueryDto implements GetMessagesQueryType {
  static schema = getMessagesQuerySchema

  userId: string
  roomId?: string
  limit?: number
  offset?: number

  constructor(data: GetMessagesQueryType) {
    Object.assign(this, GetMessagesQueryDto.schema.parse(data))
  }
}

export class GetUserRoomsQueryDto implements GetUserRoomsQueryType {
  static schema = getUserRoomsQuerySchema

  userId: string

  constructor(data: GetUserRoomsQueryType) {
    Object.assign(this, GetUserRoomsQueryDto.schema.parse(data))
  }
}

export class CreateMessageDto implements CreateMessageType {
  static schema = createMessageSchema

  text?: string
  audioAddress?: string
  voiceAddress?: string
  roomId: string
  userId: string
  messageType: 'user' | 'assistant' | 'system'
  isAi: boolean

  constructor(data: CreateMessageType) {
    Object.assign(this, CreateMessageDto.schema.parse(data))
  }
}
