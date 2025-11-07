import React from 'react'
import '@/styles/MainLayout/index.scss'
import Footer from '../../footer/Footer'

const MainLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="main__layout no-select">
      {children}
      <Footer />
    </div>
  )
}

export default React.memo(MainLayout)
