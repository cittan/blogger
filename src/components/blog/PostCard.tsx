'use client'

import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { AnimatedViews } from './AnimatedViews'
import { formatDateWithDot } from '@/utils/date'
import { getCoverSrc } from '@/utils/image'
import type { PostListItem } from '@/types'
import Link from 'next/link'
import { useState } from 'react'

function PostCover({ cover, title }: { cover: string; title: string }) {
  const [error, setError] = useState(false)
  const coverSrc = getCoverSrc(cover)

  if (!coverSrc || error) {
    return (
      <div className="w-full aspect-[4/3] bg-gradient-to-br from-accent-red/15 to-accent-amber/10 rounded-journal flex items-center justify-center">
        <span className="text-text-secondary/20 text-2xl font-serif">c</span>
      </div>
    )
  }

  return (
    <img
      src={coverSrc}
      alt={title}
      className="w-full aspect-[4/3] object-cover rounded-journal"
      onError={() => setError(true)}
    />
  )
}

export function PostCard({ post }: { post: PostListItem }) {

  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <Card hover padding="md" className="transition-all duration-300 group-hover:translate-x-1">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* 左侧 1/3：封面图，加载失败自动降级为占位符 */}
          <div className="sm:w-1/3 shrink-0">
            <PostCover cover={post.cover} title={post.title} />
          </div>

          {/* 右侧 2/3：标题 + 摘要 + 标签 + 元数据 */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent-red transition-colors line-clamp-2">
                {post.title}
              </h2>
              <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                {post.summary || '（无摘要）'}
              </p>
            </div>

            <div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {post.tags?.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs text-text-secondary/60">
                <span>{formatDateWithDot(post.publishedAt)}</span>
                <span className="text-text-secondary/30">·</span>
                <span>{post.readingTime} min</span>
                <span className="text-text-secondary/30">·</span>
                <AnimatedViews views={post.views} />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export function PostCardSkeleton() {
  return (
    <Card padding="md">
      <div className="flex flex-col sm:flex-row gap-5">
        {/* 封面骨架 */}
        <div className="sm:w-1/3 shrink-0">
          <div className="w-full aspect-[4/3] bg-text-secondary/10 rounded-journal animate-pulse" />
        </div>

        {/* 内容骨架 */}
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 bg-text-secondary/10 rounded animate-pulse" />
          <div className="h-4 w-full bg-text-secondary/10 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-text-secondary/10 rounded animate-pulse mb-3" />
          <div className="flex gap-2 mb-2">
            <div className="h-4 w-12 bg-text-secondary/10 rounded animate-pulse" />
            <div className="h-4 w-12 bg-text-secondary/10 rounded animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-3 w-24 bg-text-secondary/10 rounded animate-pulse" />
            <div className="h-3 w-10 bg-text-secondary/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </Card>
  )
}
