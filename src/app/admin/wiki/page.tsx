'use client'

import { useState } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { useAdminWikiCategories, useAdminWikiPages } from '@/hooks/useApi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import Link from 'next/link'
import type { WikiPageListItem, WikiCategory } from '@/types'

export default function AdminWikiPagesPage() {
  const queryClient = useQueryClient()
  const { data: categories } = useAdminWikiCategories()
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined)
  const [keyword, setKeyword] = useState('')
  const { data: pages, isLoading } = useAdminWikiPages({
    categoryId: selectedCategory,
    keyword: keyword || undefined,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/v1/admin/wiki/pages/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } }
        throw new Error(json.error?.message || '删除失败')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wiki-pages'] })
      queryClient.invalidateQueries({ queryKey: ['admin-wiki-category-tree'] })
    },
  })

  const handleDelete = (id: number, title: string) => {
    if (confirm(`确定要删除页面"${title}"吗？`)) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">Wiki 页面管理</h1>
        <Link href="/admin/wiki/new">
          <Button size="sm">+ 新建页面</Button>
        </Link>
      </div>

      <Card padding="md">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs text-text-secondary mb-1">分类筛选</label>
            <select
              value={selectedCategory ?? ''}
              onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-sm bg-transparent border border-accent-teal/50 rounded-md text-text-primary"
            >
              <option value="">全部分类</option>
              {categories?.map((cat: WikiCategory) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <Input
            label="搜索"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索标题或内容..."
          />
        </div>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : pages?.items.length === 0 ? (
        <Card padding="md">
          <p className="text-sm text-text-secondary text-center">暂无页面</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {pages?.items.map((page: WikiPageListItem) => {
            const category = categories?.find((c: WikiCategory) => c.id === page.categoryId)
            return (
              <Card key={page.id} padding="sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text-primary">{page.title}</p>
                      {!page.isPublished && (
                        <span className="text-xs text-text-secondary bg-bg-secondary px-2 py-0.5 rounded">
                          草稿
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      {category?.name || '未分类'} | {new Date(page.updatedAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/wiki/edit/${page.id}`}>
                      <Button size="sm" variant="ghost">编辑</Button>
                    </Link>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(page.id, page.title)}>
                      删除
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
