import { FileAttachment } from '@/store/features/chat/chatTypes'
import { MessageFlag } from '@/store/features/chat/chatTypes'

export interface InputAreaProps {
  inputValue: string
  setInputValue: (value: string) => void
  onSendMessage: (messageFlag: MessageFlag) => void
  isConnected: boolean
  isWaitingForResponse: boolean
  hasMessages?: boolean
  attachments: FileAttachment[]
  onAttachmentsChange: (attachments: FileAttachment[]) => void
}

export const TEXTAREA_MIN_HEIGHT = 40
export const TEXTAREA_MAX_HEIGHT = 200
export const MAX_FILE_SIZE = 10 * 1024 * 1024

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
]

export const FILE_ACCEPT_EXTENSIONS =
  '.pdf,.doc,.docx,.xls,.xlsx,.ods,.ppt,.pptx,.txt'

export const FORMAT_FLAGS: {
  value: MessageFlag
  label: string
  icon: string
}[] = [
  { value: 'text', label: 'Текст', icon: '📝' },
  { value: 'pdf', label: 'PDF', icon: '📄' },
  { value: 'word', label: 'Word', icon: '📘' },
  { value: 'excel', label: 'Excel', icon: '📊' },
  { value: 'powerpoint', label: 'PowerPoint', icon: '📈' },
  { value: 'checklist', label: 'Check-list', icon: '✅' },
  { value: 'business', label: 'Business', icon: '💼' },
]

export const PLACEHOLDERS = {
  waiting: 'Ожидание ответа...',
  connected: 'Задайте вопрос...',
  disconnected: 'Ожидание подключения...',
}

export const BUTTON_ICONS = {
  waiting: '⏳',
  connected: '↑',
  disconnected: '⌛',
  attach: '📎',
  remove: '✕',
}
