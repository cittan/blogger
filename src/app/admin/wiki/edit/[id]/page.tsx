'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useAdminWikiCategories, useAdminWikiPage } from '@/hooks/useApi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function AdminWikiEditPage() {
  const router = useRouter()
  const params = useParams()
  const pageId = parseInt(params.id as string)
  const { data: categories } = useAdminWikiCategories()
  const { data: page, isLoading } = useAdminWikiPage(pageId)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    categoryId: null as number | null,
    content: '',
    isPublished: false,
  })

  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title,
        slug: page.slug,
        categoryId: page.categoryId,
        content: page.content,
        isPublished: page.isPublished,
      })
    }
  }, [page])

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch(`/api/v1/admin/wiki/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error?.message || '更新失败')
      }
      return res.json()
    },
    onSuccess: () => {
      router.push('/admin/wiki')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  const handleSaveDraft = () => {
    updateMutation.mutate({ ...formData, isPublished: false })
  }

  const handlePublish = () => {
    updateMutation.mutate({ ...formData, isPublished: true })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">编辑 Wiki 页面</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={handleSaveDraft} disabled={updateMutation.isPending}>
            保存草稿
          </Button>
          <Button size="sm" onClick={handlePublish} disabled={updateMutation.isPending}>
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
                {categories?.map((cat) => (
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
