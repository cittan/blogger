'use client'

import { use } from 'react'
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer'
import { ProgressBar } from '@/components/blog/ProgressBar'
import { PostNav } from '@/components/blog/PostNav'
import { Tag } from '@/components/ui/Tag'
import { Divider } from '@/components/ui/Divider'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDateWithDot } from '@/utils/date'
import { usePost } from '@/hooks/useApi'

export const runtime = 'edge'

export default function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { data: post, isLoading, isError } = usePost(slug)

  if (isLoading) {
    return (
      <div className="max-w-content mx-auto px-6 py-12">
        <Skeleton className="h-8 w-2/3 mb-4" />
        <Skeleton className="h-4 w-32 mb-10" />
        <Skeleton className="h-96 mb-6" />
      </div>
    )
  }

  if (isError || !post) {
    return (
      <div className="max-w-content mx-auto px-6 py-12 text-center">
        <p className="text-text-secondary">文章不存在或已被删除。</p>
      </div>
    )
  }

  return (
    <>
      <ProgressBar />
      <article className="max-w-content mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-2xl font-bold text-text-primary mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <span className="text-accent-red">●</span>
            {formatDateWithDot(post.publishedAt)}
            <span>{post.readingTime} min read</span>
          </div>
          <div className="flex gap-1.5 mt-3">
            {post.tags?.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </header>

        <MarkdownRenderer content={post.content} />

        <Divider />
        <PostNav />
      </article>
    </>
  )
}
