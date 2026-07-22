'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SCROLL_THRESHOLD = 300

export function FloatingActions() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > SCROLL_THRESHOLD)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  const menuActions = [
    { label: copied ? '已复制!' : '复制链接', icon: copied ? '✓' : '🔗', onClick: copyLink },
    { label: '收起', icon: '✕', onClick: () => setOpen(false) },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {/* 回到顶部 — 滚动超过阈值后渐变展示 */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-3 py-2 rounded-journal bg-card/90 backdrop-blur border border-text-secondary/10 text-sm text-text-secondary hover:text-text-primary hover:border-text-secondary/20 transition-colors shadow-lg"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="text-xs w-4 text-center">↑</span>
            <span className="whitespace-nowrap">回到顶部</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 菜单选项 */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="flex flex-col gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
          >
            {menuActions.map((action) => (
              <motion.button
                key={action.label}
                onClick={action.onClick}
                className="flex items-center gap-2 px-3 py-2 rounded-journal bg-card/90 backdrop-blur border border-text-secondary/10 text-sm text-text-secondary hover:text-text-primary hover:border-text-secondary/20 transition-colors shadow-lg"
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-xs w-4 text-center">{action.icon}</span>
                <span className="whitespace-nowrap">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主按钮 */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-card/90 backdrop-blur border border-text-secondary/10 text-text-secondary hover:text-text-primary hover:border-text-secondary/20 transition-colors shadow-lg flex items-center justify-center"
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-lg leading-none">+</span>
      </motion.button>
    </div>
  )
}