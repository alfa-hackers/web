import React, { useRef } from 'react'
import '../../styles/landing/landing.scss'
import { FileAttachment } from '../../store/features/chat/chatTypes'

interface InputAreaProps {
  inputValue: string
  setInputValue: (value: string) => void
  onSendMessage: () => void
  isConnected: boolean
  isWaitingForResponse: boolean
  hasMessages?: boolean
  attachments: FileAttachment[]
  onAttachmentsChange: (attachments: FileAttachment[]) => void
}

const InputArea: React.FC<InputAreaProps> = ({
  inputValue,
  setInputValue,
  onSendMessage,
  isConnected,
  isWaitingForResponse,
  hasMessages = false,
  attachments,
  onAttachmentsChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newAttachments: FileAttachment[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]

      if (!allowedTypes.includes(file.type)) {
        alert(`Файл ${file.name} имеет неподдерживаемый формат`)
        continue
      }

      if (file.size > 10 * 1024 * 1024) {
        alert(`Файл ${file.name} слишком большой (максимум 10 МБ)`)
        continue
      }

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          resolve(result.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      newAttachments.push({
        filename: file.name,
        mimeType: file.type as FileAttachment['mimeType'],
        data: base64,
        size: file.size,
      })
    }

    onAttachmentsChange([...attachments, ...newAttachments])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (index: number) => {
    onAttachmentsChange(attachments.filter((_, i) => i !== index))
  }

  return (
    <div className={`input-area ${!hasMessages ? 'centered' : ''}`}>
      <div
        className={`status-panel 
          ${isConnected ? 'connected' : 'disconnected'} 
          ${!hasMessages ? 'centered' : ''}`}
      ></div>

      {attachments.length > 0 && (
        <div className="attachments-preview">
          {attachments.map((attachment, index) => (
            <div key={index} className="attachment-item">
              <span className="attachment-name">{attachment.filename}</span>
              <button
                className="remove-attachment"
                onClick={() => removeAttachment(index)}
                type="button"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="input-wrapper">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileSelect}
          disabled={!isConnected || isWaitingForResponse}
        />

        <button
          className="attach-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={!isConnected || isWaitingForResponse}
          type="button"
        >
          📎
        </button>

        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyUp={handleKeyPress}
          placeholder={
            isWaitingForResponse
              ? 'Ожидание ответа...'
              : isConnected
                ? 'Задайте вопрос...'
                : 'Ожидание подключения...'
          }
          rows={1}
          disabled={!isConnected || isWaitingForResponse}
        />

        <button
          onClick={onSendMessage}
          disabled={!inputValue.trim() || !isConnected || isWaitingForResponse}
        >
          {isWaitingForResponse ? '⏳' : isConnected ? '↑' : '⌛'}
        </button>
      </div>
    </div>
  )
}

export default InputArea
