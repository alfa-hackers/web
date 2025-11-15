import React from 'react'
import { render, screen } from '@testing-library/react'
import WelcomeScreen from '@/components/landing/WelcomeScreen'

describe('WelcomeScreen', () => {
  it('renders welcome message', () => {
    render(<WelcomeScreen isConnected={true} />)

    expect(screen.getByText('Добро пожаловать')).toBeInTheDocument()
    expect(screen.getByText('Чем я могу вам помочь?')).toBeInTheDocument()
  })
})
