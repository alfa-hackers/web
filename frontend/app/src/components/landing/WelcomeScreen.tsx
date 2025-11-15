import React from 'react'
import '../../styles/landing/landing.scss'

interface WelcomeScreenProps {
  isConnected: boolean
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ isConnected }) => {
  return (
    <div className="welcome">
      <h1>Добро пожаловать</h1>
      <p>Чем я могу вам помочь?</p>
    </div>
  )
}

export default WelcomeScreen
