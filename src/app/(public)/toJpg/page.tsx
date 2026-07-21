'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'

interface ConvertedFile {
  id: string
  originalName: string
  originalSize: number
  blob: Blob
  url: string
}

export default function ToJpgPage() {
  const [files, setFiles] = useState<ConvertedFile[]>([])
  const [converting, setConverting] = useState(false)
  const [quality, setQuality] = useState(0.92)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return

    setConverting(true)
    const converted: ConvertedFile[] = []

    for (const file of Array.from(selectedFiles)) {
      try {
        const blob = await convertToJpg(file, quality)
        const url = URL.createObjectURL(blob)
        converted.push({
          id: `${Date.now()}-${Math.random()}`,
          originalName: file.name,
          originalSize: file.size,
          blob,
          url,
        })
      } catch (err) {
        console.error(`Failed to convert ${file.name}:`, err)
      }
    }

    setFiles((prev) => [...prev, ...converted])
    setConverting(false)
  }

  const convertToJpg = (file: File, quality: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        // White background for transparent images
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Failed to convert to blob'))
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  const handleDownload = (file: ConvertedFile) => {
    const a = document.createElement('a')
    a.href = file.url
    const newName = file.originalName.replace(/\.[^.]+$/, '.jpg')
    a.download = newName
    a.click()
  }

  const handleDownloadAll = () => {
    files.forEach((file, index) => {
      setTimeout(() => handleDownload(file), index * 100)
    })
  }

  const handleRemove = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file) URL.revokeObjectURL(file.url)
      return prev.filter((f) => f.id !== id)
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    dropZoneRef.current?.classList.add('border-accent-red')
  }

  const handleDragLeave = () => {
    dropZoneRef.current?.classList.remove('border-accent-red')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dropZoneRef.current?.classList.remove('border-accent-red')
    handleFileSelect(e.dataTransfer.files)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="max-w-content mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-text-primary mb-2">WebP → JPG 转换</h1>
      <p className="text-sm text-text-secondary mb-8">纯前端转换，图片不会上传到服务器</p>

      {/* Quality control */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm text-text-secondary">JPG 质量：</label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.01"
          value={quality}
          onChange={(e) => setQuality(parseFloat(e.target.value))}
          className="flex-1 max-w-xs"
        />
        <span className="text-sm text-text-primary w-12">{Math.round(quality * 100)}%</span>
      </div>

      {/* Drop zone */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-text-secondary/20 rounded-journal p-12 text-center cursor-pointer hover:border-accent-red/50 transition-colors mb-8"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/webp,image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <p className="text-text-secondary mb-2">拖拽 WebP 文件到这里，或点击选择</p>
        <p className="text-xs text-text-secondary/60">支持批量选择</p>
      </div>

      {converting && (
        <p className="text-sm text-accent-amber mb-4">转换中...</p>
      )}

      {/* Results */}
      {files.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary">转换结果 ({files.length})</h2>
            {files.length > 1 && (
              <Button onClick={handleDownloadAll} size="sm">
                全部下载
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-card border border-text-secondary/10 rounded-journal"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{file.originalName}</p>
                  <p className="text-xs text-text-secondary mt-1">
                    {formatSize(file.originalSize)} → {formatSize(file.blob.size)}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button onClick={() => handleDownload(file)} size="sm" variant="ghost">
                    下载
                  </Button>
                  <Button onClick={() => handleRemove(file.id)} size="sm" variant="ghost">
                    ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
