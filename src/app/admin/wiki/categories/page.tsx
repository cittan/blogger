'use client'

import { useState } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { useAdminWikiCategories } from '@/hooks/useApi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import type { WikiCategory } from '@/types'

export default function AdminWikiCategoriesPage() {
  const queryClient = useQueryClient()
  const { data: categories, isLoading } = useAdminWikiCategories()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parentId: null as number | null,
    sortOrder: 0,
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/v1/admin/wiki/categories', {
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
      queryClient.invalidateQueries({ queryKey: ['admin-wiki-categories'] })
      queryClient.invalidateQueries({ queryKey: ['admin-wiki-category-tree'] })
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<typeof formData> }) => {
      const res = await fetch(`/api/v1/admin/wiki/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } }
        throw new Error(json.error?.message || '更新失败')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wiki-categories'] })
      queryClient.invalidateQueries({ queryKey: ['admin-wiki-category-tree'] })
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/v1/admin/wiki/categories/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } }
        throw new Error(json.error?.message || '删除失败')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wiki-categories'] })
      queryClient.invalidateQueries({ queryKey: ['admin-wiki-category-tree'] })
    },
  })

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ name: '', slug: '', parentId: null, sortOrder: 0 })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (category: WikiCategory) => {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId,
      sortOrder: category.sortOrder,
    })
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('确定要删除这个分类吗？子分类和页面将解除关联。')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">Wiki 分类管理</h1>
        <Button size="sm" onClick={() => setShowForm(true)}>+ 新建分类</Button>
      </div>

      {showForm && (
        <Card padding="md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="分类名称"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：Redis"
                required
              />
              <Input
                label="分类标识"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="例如：redis"
                required
              />
              <Input
                label="排序权重"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              />
              <div>
                <label className="block text-xs text-text-secondary mb-1">父分类</label>
                <select
                  value={formData.parentId ?? ''}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full bg-card border border-text-secondary/10 rounded-journal px-3 py-2 text-sm text-text-secondary outline-none"
                >
                  <option value="">无（顶级分类）</option>
                  {categories?.map((cat: WikiCategory) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                {editingId ? '更新' : '创建'}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={resetForm}>
                取消
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {categories?.map((category: WikiCategory) => (
            <Card key={category.id} padding="sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">{category.name}</p>
                  <p className="text-xs text-text-secondary">
                    标识：{category.slug} | 排序：{category.sortOrder}
                    {category.parentId && ' | 子分类'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(category)}>
                    编辑
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(category.id)}>
                    删除
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
