'use client'

import { useState } from 'react'
import { useAnimeList } from '@/hooks/useApi'
import { getCoverSrc } from "@/utils/image"
import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'
import type { Anime } from '@/types'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  watching: { label: '在追', color: '#d4745c' },
  completed: { label: '追完', color: '#8aaa7a' },
  paused: { label: '搁置', color: '#8b8680' },
  planned: { label: '想看', color: '#7a9a8a' },
}

// Anime season order: Winter (Jan) starts the year
const SEASON_ORDER: Record<string, number> = {
  '冬': 1, '冬季': 1, 'winter': 1,
  '春': 2, '春季': 2, 'spring': 2,
  '夏': 3, '夏季': 3, 'summer': 3,
  '秋': 4, '秋季': 4, 'autumn': 4, 'fall': 4,
}

export default function AnimePage() {
  const { data: animeList, isLoading, isError } = useAnimeList()
  const [statusFilter, setStatusFilter] = useState('')

  const anime = animeList ?? []
  const filtered = statusFilter ? anime.filter((a: Anime) => a.status === statusFilter) : anime

  // Group by year → season
  const grouped = new Map<number, Map<string, Anime[]>>()
  filtered.forEach((a: Anime) => {
    const year = a.year || 0
    const season = a.season || '其他'
    if (!grouped.has(year)) grouped.set(year, new Map())
    const yearGroup = grouped.get(year)!
    if (!yearGroup.has(season)) yearGroup.set(season, [])
    yearGroup.get(season)!.push(a)
  })

  const getSeasonOrder = (season: string): number => {
    return SEASON_ORDER[season] ?? 99
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-2">追番</h1>
      <p className="text-sm text-text-secondary mb-6">看过的那些动画</p>

      {/* Status filter */}
      <div className="flex gap-2 mb-10 flex-wrap">
        {[{ key: '', label: '全部' }, ...Object.entries(STATUS_MAP).map(([k, v]) => ({ key: k, label: v.label }))].map(
          (s) => (
            <button
              key={s.key}
              onClick={() => setStatusFilter(s.key)}
              className={cn(
                'px-3 py-1 text-xs rounded-full border transition-all duration-200',
                statusFilter === s.key
                  ? 'border-accent-red/40 text-accent-red bg-accent-red/5'
                  : 'border-text-secondary/10 text-text-secondary hover:border-text-secondary/25'
              )}
            >
              {s.label}
            </button>
          )
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} padding="md" className="h-24 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-accent-red">加载失败。</p>
      ) : grouped.size === 0 ? (
        <p className="text-sm text-text-secondary">还没有记录，去补番吧～</p>
      ) : (
        <div className="space-y-12">
          {Array.from(grouped.entries())
            .sort(([a], [b]) => b - a)
            .map(([year, seasons]) => (
              <section key={year}>
                <h2 className="text-lg font-bold text-text-primary mb-4">{year}</h2>
                <div className="space-y-6">
                  {Array.from(seasons.entries())
                    .sort(([a], [b]) => getSeasonOrder(a) - getSeasonOrder(b))
                    .map(([season, items]) => (
                      <div key={season}>
                        <h3 className="text-sm font-semibold text-text-secondary mb-2 pl-2 border-l-2 border-accent-red/30">
                          {season}
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {items.map((item) => {
                            const status = STATUS_MAP[item.status]
                            const progressPct = item.totalEpisodes > 0 ? (item.progress / item.totalEpisodes) * 100 : 0
                            return (
                              <Card key={item.id} padding="md" hover className="flex gap-4">
                                <div className="w-16 h-24 rounded overflow-hidden bg-text-secondary/10 flex-shrink-0 flex items-center justify-center text-xs text-text-secondary/40">
                                  {item.cover ? (
                                    <img src={getCoverSrc(item.cover) ?? undefined} alt={item.title} className="w-full h-full object-cover" />
                                  ) : (
                                    '封面'
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-bold text-text-primary mb-1 truncate">{item.title}</h3>
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-xs" style={{ color: status?.color }}>
                                      {status?.label}
                                    </span>
                                    <span className="text-xs text-text-secondary/50">
                                      {item.progress}/{item.totalEpisodes || '?'}
                                    </span>
                                  </div>
                                  <div className="h-1 bg-text-secondary/10 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all"
                                      style={{
                                        width: `${progressPct}%`,
                                        backgroundColor: status?.color ?? '#8b8680',
                                      }}
                                    />
                                  </div>
                                </div>
                                {item.notes && <p className="text-xs italic mt-2" style={{ color: "#d4745c" }}>&ldquo;{item.notes}&rdquo;</p>}
                              </Card>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  )
}
