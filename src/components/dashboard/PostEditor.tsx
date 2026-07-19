'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface PostEditorProps {
  initialData?: {
    title?: string
    slug?: string
    content?: string
    summary?: string
    category?: string
    tags?: string[]
  }
  onSave: (data: any) => void
  isSaving?: boolean
}

export function PostEditor({ initialData, onSave, isSaving }: PostEditorProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [summary, setSummary] = useState(initialData?.summary ?? '')
  const [category, setCategory] = useState(initialData?.category ?? 'tech')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ title, slug, content, summary, category, tags: [] })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="文章标题"
          className="flex-1 bg-transparent text-xl font-bold text-text-primary placeholder:text-text-secondary/30 outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-card border border-text-secondary/10 rounded-journal px-3 py-1.5 text-sm text-text-secondary"
        >
          <option value="tech">技术</option>
          <option value="life">生活</option>
          <option value="anime">动漫</option>
        </select>
      </div>

      <input
        type="text"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="文章 slug"
        className="w-full bg-transparent text-sm text-text-secondary placeholder:text-text-secondary/30 outline-none"
      />

      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="摘要（可选）"
        rows={2}
        className="w-full bg-transparent text-sm text-text-secondary placeholder:text-text-secondary/30 outline-none resize-none"
      />

      <div className="flex gap-0 h-[600px]">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="开始写 Markdown..."
          className="flex-1 bg-card border border-text-secondary/5 rounded-journal p-6 text-sm text-text-primary font-mono resize-none outline-none"
        />
        <div className="flex-1 bg-card border border-text-secondary/5 rounded-journal p-6 text-sm text-text-primary/85 overflow-y-auto ml-0 border-l-0 rounded-l-none">
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <p className="text-text-secondary/30">预览</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" size="sm">
          保存草稿
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? '保存中...' : '发布'}
        </Button>
      </div>
    </form>
  )
}
