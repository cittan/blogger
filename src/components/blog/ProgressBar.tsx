'use client'

import { useEffect, useState } from 'react'

export function ProgressBar() {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) {
        setWidth(100)
        return
      }
      setWidth(Math.min(100, (scrollTop / docHeight) * 100))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className="fixed top-0 left-0 h-[1px] z-[60]"
      style={{
        width: `${width}%`,
        backgroundColor: '#d4745c',
        transition: 'width 0.1s linear',
      }}
    />
  )
}
