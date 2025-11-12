import { useEffect, useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { socketApi } from './socketApi'
import { selectActiveChatRoomId, selectActiveChat } from './chatSelectors'
import { createChat, addMessage } from './chatSlice'
import { v4 as uuidv4 } from 'uuid'
import { FileAttachment, MessageFlag } from './chatTypes'

export const useWebSocket = () => {
  const dispatch = useAppDispatch()
  const activeChat = useAppSelector(selectActiveChat)
  const activeChatRoomId = useAppSelector(selectActiveChatRoomId)
  const [isConnected, setIsConnected] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    setIsInitializing(true)
    socketApi.initialize(dispatch)

    const initTimeout = setTimeout(() => setIsInitializing(false), 2000)
    const checkConnection = setInterval(() => {
      const connected = socketApi.isConnected()
      setIsConnected(connected)
      if (connected && isInitializing) setIsInitializing(false)
    }, 500)

    setIsConnected(socketApi.isConnected())

    return () => {
      clearTimeout(initTimeout)
      clearInterval(checkConnection)
      socketApi.disconnect()
    }
  }, [dispatch])

  useEffect(() => {
    if (activeChatRoomId && isConnected && !isInitializing && activeChat) {
      const roomName = activeChat.messages[0]?.content || activeChat.title
      socketApi.joinRoom(activeChatRoomId, roomName)
      return () => socketApi.leaveRoom(activeChatRoomId)
    }
  }, [activeChatRoomId, isConnected, isInitializing, activeChat])

  const sendMessage = useCallback(
    (
      content: string,
      messageFlag: MessageFlag = 'text',
      attachments?: FileAttachment[]
    ) => {
      if (!content.trim() || isInitializing) return

      if (!activeChat) {
        const messageId = `msg_${Date.now()}`
        const roomId = uuidv4()

        dispatch(createChat({ content, roomId, attachments, messageFlag }))

        setTimeout(() => {
          socketApi.joinRoom(roomId, content)
          socketApi.sendMessage(
            roomId,
            content,
            messageId,
            roomId,
            messageFlag,
            attachments
          )
        }, 150)
      } else {
        const messageId = `msg_${Date.now()}`
        dispatch(
          addMessage({
            chatId: activeChat.id,
            content,
            attachments,
            messageFlag,
          })
        )
        socketApi.sendMessage(
          activeChat.roomId,
          content,
          messageId,
          activeChat.id,
          messageFlag,
          attachments
        )
      }
    },
    [activeChat, dispatch, isInitializing]
  )

  return {
    sendMessage,
    isConnected: isInitializing ? false : isConnected,
    isInitializing,
  }
}
