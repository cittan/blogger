'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import { useAdminWikiCategories } from '@/hooks/useApi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import type { WikiCategory } from '@/types'
import type { MDEditorProps } from '@uiw/react-md-editor'

import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

const MDEditor = dynamic<MDEditorProps>(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false },
)

export default function AdminWikiNewPage() {
  const router = useRouter()
  const { data: categories } = useAdminWikiCategories()
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    categoryId: null as number | null,
    content: '',
    isPublished: false,
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageCopied, setImageCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/v1/admin/wiki/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } }
        throw new Error(json.error?.message || '创建失败')
      }
      return res.json()
    },
    onSuccess: () => {
      router.push('/admin/wiki')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const handleSaveDraft = () => {
    createMutation.mutate({ ...formData, isPublished: false })
  }

  const handlePublish = () => {
    createMutation.mutate({ ...formData, isPublished: true })
  }

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setImageUrl('')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', 'wiki')

    try {
      const res = await fetch('/api/v1/admin/upload', { method: 'POST', body: formData })
      const json = (await res.json()) as { success: boolean; data?: { files: { key: string; url: string }[] } }
      if (json.success && json.data?.files?.[0]) {
        const url = json.data.files[0].url
        setImageUrl(url)
        const mdImage = `![图片](${url})`
        setFormData((prev) => {
          const trimmed = prev.content.endsWith('\n') ? prev.content : prev.content + '\n'
          return { ...prev, content: trimmed + mdImage + '\n' }
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
      // fallback
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">新建 Wiki 页面</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={handleSaveDraft} disabled={createMutation.isPending}>
            保存草稿
          </Button>
          <Button size="sm" onClick={handlePublish} disabled={createMutation.isPending}>
            发布
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card padding="md">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="标题"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="页面标题"
              required
            />
            <Input
              label="标识（URL）"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="例如：redis-intro"
              required
            />
            <div>
              <label className="block text-xs text-text-secondary mb-1">分类</label>
              <select
                value={formData.categoryId ?? ''}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border rounded-md text-text-primary"
              >
                <option value="">选择分类</option>
                {categories?.map((cat: WikiCategory) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <label className="block text-xs text-text-secondary mb-2">内容（Markdown）</label>
          {/* Image upload toolbar */}
          <div className="flex items-center gap-3 flex-wrap mb-3">
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
              value={formData.content}
              onChange={(val) => setFormData({ ...formData, content: val ?? '' })}
              height={500}
              preview="live"
              visibleDragbar={false}
              textareaProps={{
                placeholder: '开始写 Markdown...',
              }}
            />
          </div>
        </Card>
      </form>
    </div>
  )
}
