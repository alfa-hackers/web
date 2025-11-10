export interface SendMessagePayload {
  roomId: string
  message: string
  messageId?: string
  chatId?: string
}

export interface JoinRoomPayload {
  roomId: string
  roomName?: string
}

export interface ConnectionInfo {
  socketId: string
  userId: string
}

export interface MessageEvent {
  userId: string
  message: string
  chatId?: string
}

export interface JoinRoomResponse {
  success: boolean
  roomId?: string
  userId?: string
  message?: string
  error?: string
}

export interface SendMessageResponse {
  success: boolean
  aiResponse?: string
  model?: string
  usage?: any
  error?: string
  details?: any
}
