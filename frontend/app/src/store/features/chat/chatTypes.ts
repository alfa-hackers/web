export interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  status?: 'sending' | 'sent' | 'error'
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  roomId: string
  isWaitingForResponse?: boolean
}

export interface ChatState {
  chats: Chat[]
  activeChat: string | null
  isCreatingNew: boolean
}
