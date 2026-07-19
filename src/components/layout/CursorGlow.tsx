'use client'

import { useEffect, useRef } from 'react'

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)
  const posRef = useRef({ x: -500, y: -500 })
  const targetRef = useRef({ x: -500, y: -500 })

  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return

    const handleMouse = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY }
    }

    let animId: number
    const animate = () => {
      posRef.current.x += (targetRef.current.x - posRef.current.x) * 0.06
      posRef.current.y += (targetRef.current.y - posRef.current.y) * 0.06

      glow.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`
      animId = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouse, { passive: true })
    animate()

    return () => {
      window.removeEventListener('mousemove', handleMouse)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <div
      ref={glowRef}
      className="fixed pointer-events-none z-0"
      style={{
        width: 600,
        height: 600,
        borderRadius: '50%',
        background:
          'radial-gradient(circle at center, rgba(122, 154, 138, 0.07) 0%, rgba(212, 116, 92, 0.04) 25%, rgba(230, 180, 80, 0.02) 50%, transparent 70%)',
        transform: 'translate(-50%, -50%)',
        willChange: 'transform',
      }}
      aria-hidden="true"
    />
  )
}
