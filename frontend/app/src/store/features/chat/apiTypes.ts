export interface ApiMessage {
  id: string
  text: string
  messageType: 'user' | 'assistant'
  isAi: boolean
  roomId: string
  file_address?: string
  createdAt: string
  file_name?: string
}

export interface ApiRoom {
  id: string
  name: string
  description: string | null
}
