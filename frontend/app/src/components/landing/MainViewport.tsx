import React from 'react'
import {
  Chat,
  FileAttachment,
  MessageFlag,
} from '../../store/features/chat/chatTypes'
import WelcomeScreen from './WelcomeScreen'
import MessagesList from './MessagesList'
import InputArea from './InputArea'
import '../../styles/landing/landing.scss'

interface MainViewportProps {
  currentChat?: Chat
  isConnected: boolean
  inputValue: string
  setInputValue: (value: string) => void
  onSendMessage: (messageFlag: MessageFlag) => void
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  attachments: FileAttachment[]
  onAttachmentsChange: (attachments: FileAttachment[]) => void
}

const MainViewport: React.FC<MainViewportProps> = ({
  currentChat,
  isConnected,
  inputValue,
  setInputValue,
  onSendMessage,
  messagesEndRef,
  attachments,
  onAttachmentsChange,
}) => {
  const hasMessages = currentChat?.messages && currentChat.messages.length > 0
  const isWaitingForResponse = currentChat?.isWaitingForResponse || false

  return (
    <main className={`viewport ${hasMessages ? 'has-messages' : ''}`}>
      {!hasMessages && <WelcomeScreen isConnected={isConnected} />}

      {hasMessages && (
        <MessagesList
          messages={currentChat.messages}
          isWaitingForResponse={isWaitingForResponse}
          messagesEndRef={messagesEndRef}
        />
      )}

      <InputArea
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSendMessage={onSendMessage}
        isConnected={isConnected}
        isWaitingForResponse={isWaitingForResponse}
        hasMessages={hasMessages}
        attachments={attachments}
        onAttachmentsChange={onAttachmentsChange}
      />
    </main>
  )
}

export default MainViewport
