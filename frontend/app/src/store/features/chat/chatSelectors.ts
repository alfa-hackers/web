import { RootState } from '../../store'

export const selectChats = (state: RootState) => state.chat.chats
export const selectActiveChatId = (state: RootState) => state.chat.activeChat
export const selectIsCreatingNew = (state: RootState) =>
  state.chat.isCreatingNew

export const selectActiveChat = (state: RootState) => {
  const { chats, activeChat } = state.chat
  return chats.find((chat) => chat.id === activeChat) || null
}

export const selectActiveChatRoomId = (state: RootState) => {
  const activeChat = selectActiveChat(state)
  return activeChat?.roomId || null
}

export const selectChatMessages = (chatId: string) => (state: RootState) => {
  const chat = state.chat.chats.find((c) => c.id === chatId)
  return chat?.messages || []
}
