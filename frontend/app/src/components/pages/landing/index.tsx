import React from 'react'
import '@/styles/MainLayout/index.scss'

const MainLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="main__layout no-select">
      {children}
    </div>
  )
}

export default React.memo(MainLayout)
