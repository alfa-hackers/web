import {
  getUserRoomsSchema,
  GetUserRoomsType,
} from 'controllers/rooms/dto/rooms.schema'

export class GetUserRoomsDto implements GetUserRoomsType {
  static schema = getUserRoomsSchema

  userId: string

  constructor(data: GetUserRoomsType) {
    Object.assign(this, GetUserRoomsDto.schema.parse(data))
  }
}
