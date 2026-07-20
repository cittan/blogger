'use client'

import { useEffect, useRef } from 'react'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative bg-card border border-text-secondary/10 rounded-journal p-6 w-full max-w-sm mx-4 shadow-xl"
      >
        <h3 className="text-base font-bold text-text-primary mb-2">{title}</h3>
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button type="button" size="sm" onClick={onConfirm} disabled={loading}>
            {loading ? '处理中...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
