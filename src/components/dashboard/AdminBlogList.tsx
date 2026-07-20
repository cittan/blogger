'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ContextMenu } from './ContextMenu'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { PostListItem } from '@/types'
import Link from 'next/link'

interface AdminPostItem extends PostListItem {
  isPublished?: number | boolean
}

export function AdminBlogList() {
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    post: AdminPostItem
  } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: async () => {
      const res = await fetch('/api/v1/admin/posts')
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`API ${res.status}: ${text.slice(0, 200)}`)
      }
      const json = (await res.json()) as {
        success: boolean
        error?: { message: string }
        data: unknown
      }
      if (!json.success) throw new Error(json.error?.message ?? '获取文章列表失败')
      return json.data as { items: AdminPostItem[]; nextCursor: string | null; hasMore: boolean }
    },
    staleTime: 30 * 1000,
    retry: 1,
  })

  const pinMutation = useMutation({
    mutationFn: async ({ slug }: { slug: string }) => {
      const res = await fetch('/api/v1/admin/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      if (!res.ok) throw new Error('操作失败')
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-posts'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (slug: string) => {
      const res = await fetch(`/api/v1/admin/posts?slug=${slug}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('删除失败')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-posts'] }),
  })

  const handleContextMenu = (e: React.MouseEvent, post: AdminPostItem) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, post })
  }

  const handleDelete = (slug: string) => {
    setDeleteTarget(slug)
  }

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget)
      setDeleteTarget(null)
    }
  }

  const posts: AdminPostItem[] = data?.items ?? []

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-accent-red mb-3">
          {error instanceof Error ? error.message : '加载失败'}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-1.5 text-xs rounded-full border border-accent-red/40 text-accent-red hover:bg-accent-red/5 transition-all"
        >
          重试
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 bg-text-secondary/5 rounded-journal animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <p className="text-sm text-text-secondary py-8 text-center">暂无文章</p>
    )
  }

  return (
    <div className="space-y-1">
      {posts.map((post) => (
        <div
          key={post.slug}
          className="flex items-center gap-4 px-4 py-3 rounded-journal hover:bg-text-secondary/5 transition-colors cursor-context-menu"
          onContextMenu={(e) => handleContextMenu(e, post)}
        >
          {/* Pin indicator */}
          <span className="text-xs w-6 text-center shrink-0">
            {post.isPinned ? (
              <span title="已置顶" className="text-accent-amber">📌</span>
            ) : null}
          </span>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-primary truncate">{post.title}</span>
              {!post.isPublished && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-amber/15 text-accent-amber shrink-0">
                  草稿
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary/60 mt-0.5">
              {post.slug}
              {post.publishedAt && (
                <>
                  <span className="mx-1.5 text-text-secondary/30">·</span>
                  {new Date(post.publishedAt).toLocaleDateString('zh-CN')}
                </>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/admin/posts/${post.slug}/edit`}
              className="text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              编辑
            </Link>
          </div>
        </div>
      ))}

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            {
              label: contextMenu.post.isPinned ? '取消置顶' : '置顶博客',
              onClick: () => pinMutation.mutate({ slug: contextMenu.post.slug }),
            },
            {
              label: '删除博客',
              onClick: () => handleDelete(contextMenu.post.slug),
              danger: true,
            },
          ]}
        />
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="删除博客"
        message="确定要删除这篇文章吗？此操作不可撤销。"
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
