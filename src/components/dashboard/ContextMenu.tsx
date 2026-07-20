'use client'

import { useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  items: { label: string; onClick: () => void; danger?: boolean }[]
}

export function ContextMenu({ x, y, onClose, items }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Use mousedown to catch the right-click itself as well
    document.addEventListener('mousedown', handler)
    document.addEventListener('contextmenu', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('contextmenu', handler)
    }
  }, [onClose])

  // Adjust position to stay within viewport
  const adjustedPos = useMemo(() => {
    const menuW = 160
    const menuH = items.length * 40
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1920
    const vh = typeof window !== 'undefined' ? window.innerHeight : 1080

    let left = x
    let top = y

    if (left + menuW > vw) left = vw - menuW - 8
    if (top + menuH > vh) top = vh - menuH - 8

    return { left, top }
  }, [x, y, items.length])

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        className="fixed z-[200] bg-card border border-text-secondary/10 rounded-journal shadow-2xl py-1 min-w-[160px]"
        style={{ left: adjustedPos.left, top: adjustedPos.top }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              item.onClick()
              onClose()
            }}
            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
              item.danger
                ? 'text-accent-red hover:bg-accent-red/10'
                : 'text-text-secondary hover:bg-text-secondary/5 hover:text-text-primary'
            }`}
          >
            {item.label}
          </button>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}
