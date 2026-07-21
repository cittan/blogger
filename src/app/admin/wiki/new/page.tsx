'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useAdminWikiCategories } from '@/hooks/useApi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import type { WikiCategory } from '@/types'

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
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="在此输入 Markdown 内容..."
            rows={20}
            className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border rounded-md text-text-primary font-mono"
            required
          />
        </Card>
      </form>
    </div>
  )
}
