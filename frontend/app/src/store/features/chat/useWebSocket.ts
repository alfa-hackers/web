/* eslint-disable */

import { useEffect, useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { socketApi } from './socketApi'
import { selectActiveChatRoomId, selectActiveChat } from './chatSelectors'
import { createChat, addMessage } from './chatSlice'

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
    if (activeChatRoomId && isConnected) {
      socketApi.joinRoom(activeChatRoomId)
      return () => socketApi.leaveRoom(activeChatRoomId)
    }
  }, [activeChatRoomId, isConnected])

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return

      if (!activeChat) {
        dispatch(createChat({ content }))
        setTimeout(() => {
          const state = (window as any).__REDUX_STORE__?.getState()
          const newActiveChat = state?.chat?.chats[0]
          if (newActiveChat) {
            const messageId = newActiveChat.messages[0]?.id
            socketApi.sendMessage(newActiveChat.roomId, content, messageId)
          }
        }, 0)
      } else {
        dispatch(addMessage({ chatId: activeChat.id, content }))
        const messageId = `msg_${Date.now()}`
        socketApi.sendMessage(activeChat.roomId, content, messageId)
      }
    },
    [activeChat, dispatch]
  )

  return {
    sendMessage,
    isConnected: isInitializing ? true : isConnected,
    isInitializing,
  }
}
