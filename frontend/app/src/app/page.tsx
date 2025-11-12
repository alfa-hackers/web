'use client'

import React, { useRef } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/store/store'
import ChatLanding from '../components/landing/landing'
import '@/styles/Global/index.scss'

export default function Home() {
  const mainContentRef = useRef<HTMLDivElement>(null)

  return (
    <Provider store={store}>
      <div>
        <div ref={mainContentRef}>
          <ChatLanding />
        </div>
      </div>
    </Provider>
  )
}
