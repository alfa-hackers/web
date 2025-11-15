import React, { useState, useRef, useEffect } from 'react'
import '@/styles/landing/formatdropdown.scss'
import { FORMAT_FLAGS } from './consts'

interface FormatOption {
  value: string
  label: string
  icon: React.ReactNode
}

const FormatDropdown: React.FC<{
  selectedFlag: string
  setSelectedFlag: (value: string) => void
  isInputDisabled?: boolean
}> = ({ selectedFlag, setSelectedFlag, isInputDisabled = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleDropdown = () => {
    if (!isInputDisabled) {
      setIsOpen(!isOpen)
    }
  }
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen) return

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="format-dropdown" ref={dropdownRef}>
      <button
        className={`dropdown-toggle ${isOpen ? 'open' : ''}`}
        onClick={toggleDropdown}
        disabled={isInputDisabled}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title="Select format"
      >
        <span className="toggle-icon">▾</span>
      </button>

      {isOpen && (
        <ul className="dropdown-menu" role="listbox">
          {FORMAT_FLAGS.map((flag) => (
            <li key={flag.value} role="option">
              <button
                className={`format-option ${selectedFlag === flag.value ? 'active' : ''}`}
                onClick={() => {
                  setSelectedFlag(flag.value)
                  setIsOpen(false)
                }}
                type="button"
                aria-selected={selectedFlag === flag.value}
              >
                <span className="format-icon">{flag.icon}</span>
                <span className="format-text">{flag.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default FormatDropdown
