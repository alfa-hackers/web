/* eslint-disable */

import { configureStore } from '@reduxjs/toolkit'
import chatReducer from './features/chat/chatSlice'

export const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
})

if (typeof window !== 'undefined') {
  ;(window as any).__REDUX_STORE__ = store
}

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
