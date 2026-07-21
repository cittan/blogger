'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ContextMenu } from './ContextMenu'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { Anime } from '@/types'

interface AdminAnimeItem extends Anime {}

export function AdminAnimeList() {
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    anime: AdminAnimeItem
  } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-anime'],
    queryFn: async () => {
      const res = await fetch('/api/v1/admin/anime')
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`API ${res.status}: ${text.slice(0, 200)}`)
      }
      const json = (await res.json()) as {
        success: boolean
        error?: { message: string }
        data: unknown
      }
      if (!json.success) throw new Error(json.error?.message ?? '获取追番列表失败')
      return json.data as AdminAnimeItem[]
    },
    staleTime: 30 * 1000,
    retry: 1,
  })

  const deleteMutation = useMutation({
    mutationFn: async (slug: string) => {
      const res = await fetch(`/api/v1/admin/anime?slug=${slug}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('删除失败')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-anime'] }),
  })

  const updateProgressMutation = useMutation({
    mutationFn: async ({ slug, progress }: { slug: string; progress: number }) => {
      const res = await fetch('/api/v1/admin/anime', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, progress }),
      })
      if (!res.ok) throw new Error('更新进度失败')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-anime'] }),
  })

  const handleContextMenu = (e: React.MouseEvent, anime: AdminAnimeItem) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, anime })
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

  const handleProgressChange = (anime: AdminAnimeItem, delta: number) => {
    const newProgress = Math.max(0, Math.min(anime.totalEpisodes, anime.progress + delta))
    if (newProgress !== anime.progress) {
      updateProgressMutation.mutate({ slug: anime.slug, progress: newProgress })
    }
  }

  const animes: AdminAnimeItem[] = data ?? []

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-accent-red mb-3">
          加载失败：{error instanceof Error ? error.message : '未知错误'}
        </p>
        <button
          onClick={() => refetch()}
          className="text-xs text-text-secondary hover:text-text-primary underline"
        >
          重试
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="w-12 h-16 bg-text-secondary/10 rounded animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-text-secondary/10 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-text-secondary/10 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (animes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-text-secondary">暂无追番记录</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {animes.map((anime) => (
        <div
          key={anime.slug}
          className="flex items-center gap-4 px-4 py-3 rounded-journal hover:bg-text-secondary/5 transition-colors cursor-context-menu"
          onContextMenu={(e) => handleContextMenu(e, anime)}
        >
          {/* Cover */}
          <div className="w-12 h-16 shrink-0">
            {anime.cover ? (
              <img
                src={anime.cover}
                alt={anime.title}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="w-full h-full bg-text-secondary/10 rounded flex items-center justify-center">
                <span className="text-text-secondary/20 text-xs">无</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-primary truncate">
                {anime.title}
              </span>
              <span className="text-xs text-text-secondary/60 shrink-0">
                {anime.year} · {anime.season}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-text-secondary/60">{anime.slug}</span>
              <span className="text-xs text-text-secondary/40">·</span>
              <div className="w-20 h-1 bg-text-secondary/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${anime.totalEpisodes > 0 ? (anime.progress / anime.totalEpisodes) * 100 : 0}%`,
                    backgroundColor: anime.progress >= anime.totalEpisodes && anime.totalEpisodes > 0 ? '#8aaa7a' : '#d4745c',
                  }}
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleProgressChange(anime, -1)}
                  disabled={anime.progress <= 0}
                  className="w-4 h-4 text-xs text-text-secondary hover:text-accent-red disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="text-xs text-text-secondary min-w-[2rem] text-center">
                  {anime.progress} / {anime.totalEpisodes}
                </span>
                <button
                  onClick={() => handleProgressChange(anime, 1)}
                  disabled={anime.progress >= anime.totalEpisodes}
                  className="w-4 h-4 text-xs text-text-secondary hover:text-accent-red disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-text-secondary/40">·</span>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => {
                  const starValue = (i + 1) * 2
                  const filled = anime.rating >= starValue
                  const half = !filled && anime.rating >= starValue - 1
                  return (
                    <span
                      key={i}
                      className={`text-xs ${filled ? 'text-accent-amber' : half ? 'text-accent-amber/50' : 'text-text-secondary/20'}`}
                    >
                      ★
                    </span>
                  )
                })}
              </div>
            </div>
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
              label: '删除追番',
              onClick: () => handleDelete(contextMenu.anime.slug),
              danger: true,
            },
          ]}
        />
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="删除追番"
        message="确定要删除这条追番记录吗？此操作不可撤销。"
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
