'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/Button'
import { CoverUpload } from './CoverUpload'

import type { MDEditorProps } from '@uiw/react-md-editor'

// The dynamic import below handles the JS bundle; we import CSS statically
// so Next.js can process it at build time.
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

// Dynamic import to avoid SSR (CodeMirror uses browser APIs)
const MDEditor = dynamic<MDEditorProps>(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false },
)

const CATEGORIES = [
  { value: 'tech', label: '技术' },
  { value: 'life', label: '生活' },
  { value: 'anime', label: '动漫' },
  { value: 'essay', label: '随笔' },
]

interface PostEditorProps {
  initialData?: {
    title?: string
    slug?: string
    content?: string
    summary?: string
    category?: string
    cover?: string
  }
  onSave: (data: {
    title: string
    slug: string
    content: string
    summary: string
    category: string
    cover: string
    tags: string[]
    isPublished: boolean
  }) => void
  isSaving?: boolean
}

export function PostEditor({ initialData, onSave, isSaving }: PostEditorProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [summary, setSummary] = useState(initialData?.summary ?? '')
  const [cover, setCover] = useState(initialData?.cover ?? '')
  const [category, setCategory] = useState(initialData?.category ?? 'tech')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageCopied, setImageCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setImageUrl('')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', 'content')

    try {
      const res = await fetch('/api/v1/admin/upload', { method: 'POST', body: formData })
      const json = (await res.json()) as { success: boolean; data?: { files: { key: string; url: string }[] } }
      if (json.success && json.data?.files?.[0]) {
        const url = json.data.files[0].url
        setImageUrl(url)
        // Insert markdown image syntax at end of content
        const mdImage = `![图片](${url})`
        setContent((prev) => {
          const trimmed = prev.endsWith('\n') ? prev : prev + '\n'
          return trimmed + mdImage + '\n'
        })
      }
    } finally {
      setUploadingImage(false)
    }
  }

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(`![图片](${url})`)
      setImageCopied(true)
      setTimeout(() => setImageCopied(false), 2000)
    } catch {
      // fallback: url already displayed
    }
  }

  const handleSubmit = (e: React.SyntheticEvent, isPublished: boolean) => {
    e.preventDefault()
    onSave({ title, slug, content, summary, category, cover, tags: [], isPublished })
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    // Auto-generate slug from title if slug is empty or was auto-generated
    if (!initialData?.slug) {
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9一-鿿]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setSlug(autoSlug)
    }
  }

  return (
    <form className="space-y-6">
      {/* Cover Upload */}
      <CoverUpload value={cover} onChange={setCover} />

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="文章标题"
        className="w-full bg-transparent text-2xl font-bold text-text-primary placeholder:text-text-secondary/30 outline-none"
        required
      />

      {/* Slug */}
      <input
        type="text"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="文章 slug（用于 URL）"
        className="w-full bg-transparent text-sm text-text-secondary placeholder:text-text-secondary/30 outline-none"
        required
      />

      {/* Summary / Meta description */}
      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="摘要 / 描述（可选）"
        rows={2}
        className="w-full bg-transparent text-sm text-text-secondary placeholder:text-text-secondary/30 outline-none resize-none"
      />

      {/* Image upload toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUploadImage}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          className="px-3 py-1.5 text-xs rounded-journal border border-text-secondary/20 text-text-secondary hover:text-accent-red hover:border-accent-red transition-colors"
        >
          {uploadingImage ? '上传中...' : '📷 插入图片'}
        </button>
        {imageUrl && (
          <span className="flex items-center gap-2 text-xs text-accent-green">
            ✓ 已插入
            <button
              type="button"
              onClick={() => handleCopyUrl(imageUrl)}
              className="text-text-secondary hover:text-text-primary underline"
            >
              {imageCopied ? '已复制!' : '复制链接'}
            </button>
          </span>
        )}
      </div>

      {/* Markdown Editor */}
      <div data-color-mode="dark">
        <MDEditor
          value={content}
          onChange={(val) => setContent(val ?? '')}
          height={500}
          preview="live"
          visibleDragbar={false}
          textareaProps={{
            placeholder: '开始写 Markdown...',
          }}
        />
      </div>

      {/* Bottom bar: category + actions */}
      <div className="flex items-center justify-between">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-card border border-text-secondary/10 rounded-journal px-3 py-1.5 text-sm text-text-secondary outline-none"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <div className="flex gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSubmit(e, false)} disabled={isSaving}>
            保存草稿
          </Button>
          <Button type="button" onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSubmit(e, true)} disabled={isSaving}>
            {isSaving ? '保存中...' : '发布'}
          </Button>
        </div>
      </div>
    </form>
  )
}
