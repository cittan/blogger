'use client'

import { useEffect, useRef } from 'react'

interface ParallaxTarget {
  ref: React.RefObject<HTMLElement | null>
  factor: number
}

export function useCursorEffect(targets: ParallaxTarget[]) {
  const rafRef = useRef<number>()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)

      rafRef.current = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2
        const y = (e.clientY / window.innerHeight - 0.5) * 2

        targets.forEach(({ ref, factor }) => {
          const el = ref.current
          if (!el) return
          const dx = x * factor
          const dy = y * factor
          el.style.transform = `translate(${dx}px, ${dy}px)`
        })
      })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [targets])
}
