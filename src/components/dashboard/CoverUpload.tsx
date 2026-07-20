'use client'

import { useRef, useState } from 'react'
import { getCoverSrc } from '@/utils/image'

interface CoverUploadProps {
  value: string
  onChange: (url: string) => void
}

export function CoverUpload({ value, onChange }: CoverUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', 'cover')

    try {
      const res = await fetch('/api/v1/admin/upload', { method: 'POST', body: formData })
      const json = (await res.json()) as { success: boolean; data?: { files: { key: string; url: string }[] } }
      if (json.success && json.data?.files?.[0]) {
        const url = json.data.files[0].url
        onChange(url)
        setPreview(url)
      }
    } finally {
      setUploading(false)
    }
  }

  const displaySrc = preview || getCoverSrc(value)
  const showPreview = !!displaySrc

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      {showPreview ? (
        <div className="relative group">
          <img
            src={displaySrc}
            alt="封面图"
            className="w-full h-48 object-cover rounded-journal"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors rounded-journal"
          >
            <span className="opacity-0 group-hover:opacity-100 text-white text-sm transition-opacity">
              {uploading ? '上传中...' : '更换封面'}
            </span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-48 border-2 border-dashed border-text-secondary/20 rounded-journal flex flex-col items-center justify-center gap-2 text-text-secondary/50 hover:text-text-secondary hover:border-text-secondary/40 transition-colors"
        >
          <span className="text-4xl font-light">+</span>
          <span className="text-sm">{uploading ? '上传中...' : '点击上传封面图'}</span>
        </button>
      )}
    </div>
  )
}
