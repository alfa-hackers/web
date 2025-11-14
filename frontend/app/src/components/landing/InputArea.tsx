import React, { useRef, useState, useEffect } from 'react'
import '../../styles/landing/inputarea.scss'
import {
  FileAttachment,
  MessageFlag,
} from '../../store/features/chat/chatTypes'
import {
  BUTTON_ICONS,
  FILE_ACCEPT_EXTENSIONS,
  FORMAT_FLAGS,
  MAX_FILE_SIZE,
  PLACEHOLDERS,
  TEXTAREA_MAX_HEIGHT,
  TEXTAREA_MIN_HEIGHT,
  ALLOWED_FILE_TYPES,
  InputAreaProps,
} from './consts'

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
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [selectedFlag, setSelectedFlag] = useState<MessageFlag>('text')

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    const newHeight = Math.max(
      TEXTAREA_MIN_HEIGHT,
      Math.min(textarea.scrollHeight, TEXTAREA_MAX_HEIGHT)
    )
    textarea.style.height = `${newHeight}px`
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [inputValue])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage(selectedFlag)
    }
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(',')[1])
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `Файл ${file.name} имеет неподдерживаемый формат`
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Файл ${file.name} слишком большой (максимум 10 МБ)`
    }
    return null
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newAttachments: FileAttachment[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const error = validateFile(file)

      if (error) {
        alert(error)
        continue
      }

      const base64 = await convertFileToBase64(file)

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

  const getPlaceholder = (): string => {
    if (isWaitingForResponse) return PLACEHOLDERS.waiting
    if (isConnected) return PLACEHOLDERS.connected
    return PLACEHOLDERS.disconnected
  }

  const getSendButtonIcon = (): string => {
    if (isWaitingForResponse) return BUTTON_ICONS.waiting
    if (isConnected) return BUTTON_ICONS.connected
    return BUTTON_ICONS.disconnected
  }

  const isInputDisabled = !isConnected || isWaitingForResponse
  const isSendDisabled = !inputValue.trim() || isInputDisabled

  return (
    <div className={`input-area ${!hasMessages ? 'centered' : ''}`}>
      <div
        className={`status-panel 
          ${isConnected ? 'connected' : 'disconnected'} 
          ${!hasMessages ? 'centered' : ''}`}
      />

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
                {BUTTON_ICONS.remove}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="format-selector">
        <span className="format-label">Формат ответа:</span>
        <div className="format-options">
          {FORMAT_FLAGS.map((flag) => (
            <button
              key={flag.value}
              className={`format-badge ${selectedFlag === flag.value ? 'active' : ''}`}
              onClick={() => setSelectedFlag(flag.value)}
              disabled={isInputDisabled}
              type="button"
              title={flag.label}
            >
              <span className="format-icon">{flag.icon}</span>
              <span className="format-text">{flag.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="input-wrapper">
        <input
          ref={fileInputRef}
          type="file"
          accept={FILE_ACCEPT_EXTENSIONS}
          multiple
          style={{ display: 'none' }}
          onChange={handleFileSelect}
          disabled={isInputDisabled}
        />

        <button
          className="attach-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isInputDisabled}
          type="button"
        >
          {BUTTON_ICONS.attach}
        </button>

        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyUp={handleKeyPress}
          placeholder={getPlaceholder()}
          rows={1}
          disabled={isInputDisabled}
          style={{ resize: 'none', overflow: 'hidden' }}
        />

        <button
          onClick={() => onSendMessage(selectedFlag)}
          disabled={isSendDisabled}
        >
          {getSendButtonIcon()}
        </button>
      </div>
    </div>
  )
}

export default InputArea
