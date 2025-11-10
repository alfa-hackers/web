import {
  getMessagesQuerySchema,
  getUserRoomsQuerySchema,
  GetMessagesQueryType,
  GetUserRoomsQueryType,
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
