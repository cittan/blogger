'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'

export function MediaUploader() {
  const [uploading, setUploading] = useState(false)
  const [url, setUrl] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/v1/admin/upload', { method: 'POST', body: formData })
      const data = (await res.json()) as { success: boolean; data: { url: string } }
      if (data.success) setUrl(data.data.url)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? '上传中...' : '选择图片'}
      </Button>
      {url && (
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span className="text-accent-green">✓</span>
          上传成功:
          <code className="text-accent-amber bg-card px-2 py-0.5 rounded">{url}</code>
        </div>
      )}
    </div>
  )
}
