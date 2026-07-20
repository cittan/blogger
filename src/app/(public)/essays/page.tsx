'use client'

import { PostCard, PostCardSkeleton } from '@/components/blog/PostCard'
import { useEssays } from '@/hooks/useApi'
import { Essay } from '@/types'

export default function EssaysPage() {
  const { data, isLoading, isError } = useEssays()
  const essays = data?.items ?? []

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">杂谈</h1>
          <p className="text-sm text-text-secondary">随便写写</p>
        </div>
        <button className="text-xs text-text-secondary hover:text-accent-red transition-colors border border-text-secondary/15 rounded-journal px-3 py-1.5">
          随机一篇
        </button>
      </div>
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)
        ) : isError ? (
          <p className="text-sm text-accent-red">加载失败。</p>
        ) : essays.length === 0 ? (
          <p className="text-sm text-text-secondary">还没有杂谈。</p>
        ) : (
          essays.map((essay: Essay) => (
            <PostCard
              key={essay.id}
              post={{
                id: essay.id,
                title: essay.title,
                slug: essay.slug,
                summary: essay.summary,
                cover: '',
                category: 'essay',
                tags: [],
                publishedAt: essay.publishedAt,
                readingTime: essay.readingTime,
                views: 0,
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}
