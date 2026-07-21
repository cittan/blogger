'use client'

import { StatsCard } from '@/components/dashboard/StatsCard'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useStats } from '@/hooks/useApi'
import type { PostListItem } from '@/types'
import Link from 'next/link'

export default function AdminDashboard() {
  const { data: stats, isLoading, isError } = useStats()

  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary mb-6">仪表盘</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <StatsCard title="文章数量" value={stats?.totalPosts ?? 0} subtitle="已发布" />
            <StatsCard title="总浏览量" value={stats?.totalViews ?? 0} />
            <StatsCard title="追番数量" value={stats?.totalAnime ?? 0} subtitle={`在追 ${stats?.watchingAnime ?? 0}`} />
            <StatsCard title="知识库" value="--" subtitle="个分类" />
          </>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-sm font-bold text-text-primary mb-4">最近发布</h2>
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)
            ) : (stats?.recentPosts ?? []).length === 0 ? (
              <p className="text-xs text-text-secondary">暂无文章</p>
            ) : (
              (stats?.recentPosts ?? []).map((post: PostListItem) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card padding="sm" hover>
                    <p className="text-sm text-text-primary">{post.title}</p>
                    <p className="text-xs text-text-secondary mt-1">{post.views} 浏览</p>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </section>
        <section>
          <h2 className="text-sm font-bold text-text-primary mb-4">热门文章</h2>
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)
            ) : (stats?.popularPosts ?? []).length === 0 ? (
              <p className="text-xs text-text-secondary">暂无数据</p>
            ) : (
              (stats?.popularPosts ?? []).map((post: PostListItem) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card padding="sm" hover>
                    <p className="text-sm text-text-primary">{post.title}</p>
                    <p className="text-xs text-text-secondary mt-1">{post.views} 浏览</p>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
