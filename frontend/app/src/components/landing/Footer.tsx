import React, { useEffect, useRef } from 'react'
import '@/styles/MainLayout/footer.scss'

const Footer: React.FC = () => {
  const footerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (footerRef.current) {
        const scrollTop = window.scrollY
        footerRef.current.style.backgroundPositionY = `${scrollTop * 0.5}px`
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <footer ref={footerRef} className="footer">
      <div className="container">
        <div className="brand">
          <h2>MyBrand</h2>
          <p>© {new Date().getFullYear()} MyBrand. All rights reserved.</p>
        </div>

        <div className="links">
          <div className="linkGroup">
            <h4>Company</h4>
            <ul>
              <li>
                <a href="/about">About Us</a>
              </li>
              <li>
                <a href="/careers">Careers</a>
              </li>
              <li>
                <a href="/contact">Contact</a>
              </li>
            </ul>
          </div>

          <div className="linkGroup">
            <h4>Resources</h4>
            <ul>
              <li>
                <a href="/blog">Blog</a>
              </li>
              <li>
                <a href="/docs">Docs</a>
              </li>
              <li>
                <a href="/support">Support</a>
              </li>
            </ul>
          </div>

          <div className="linkGroup">
            <h4>Follow Us</h4>
            <div className="socials">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
