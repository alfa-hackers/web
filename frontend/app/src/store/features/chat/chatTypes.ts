export interface FileAttachment {
  filename: string
  mimeType:
    | 'application/pdf'
    | 'application/msword'
    | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    | 'application/vnd.ms-excel'
    | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    | 'application/vnd.oasis.opendocument.spreadsheet'
  data: string
  size: number
}

export interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  status?: 'sending' | 'sent' | 'error'
  attachments?: FileAttachment[]
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
  isLoading?: boolean
  error?: string | null
}
