import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { formatDateWithDot } from '@/utils/date'
import type { PostListItem } from '@/types'
import Link from 'next/link'

export function PostCard({ post }: { post: PostListItem }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <Card hover padding="md" className="transition-all duration-300 group-hover:translate-x-1">
        <div className="flex items-start gap-4">
          <span className="text-xs text-accent-red whitespace-nowrap mt-0.5 transition-all duration-300 group-hover:scale-110">
            ●
          </span>
          <div className="min-w-0 flex-1">
            <span className="text-xs text-text-secondary block mb-1">
              {formatDateWithDot(post.publishedAt)}
            </span>
            <h2 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent-red transition-colors line-clamp-2">
              {post.title}
            </h2>
            <p className="text-sm text-text-secondary line-clamp-2 mb-3">
              {post.summary || '（无摘要）'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {post.tags?.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </div>
          <span className="text-xs text-text-secondary/50 whitespace-nowrap">
            {post.readingTime} min
          </span>
        </div>
      </Card>
    </Link>
  )
}

export function PostCardSkeleton() {
  return (
    <Card padding="md">
      <div className="flex items-start gap-4">
        <div className="w-2 h-2 mt-0.5 rounded-full bg-text-secondary/10 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 bg-text-secondary/10 rounded animate-pulse" />
          <div className="h-5 w-3/4 bg-text-secondary/10 rounded animate-pulse" />
          <div className="h-4 w-full bg-text-secondary/10 rounded animate-pulse" />
        </div>
      </div>
    </Card>
  )
}
