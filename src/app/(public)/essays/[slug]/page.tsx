'use client'

import { use } from 'react'
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer'
import { ProgressBar } from '@/components/blog/ProgressBar'
import { Divider } from '@/components/ui/Divider'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDateWithDot } from '@/utils/date'
import { useEssay } from '@/hooks/useApi'

export const runtime = 'edge'

export default function EssayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { data: essay, isLoading, isError } = useEssay(slug)

  if (isLoading) {
    return (
      <div className="max-w-content mx-auto px-6 py-12">
        <Skeleton className="h-8 w-2/3 mb-4" />
        <Skeleton className="h-4 w-32 mb-10" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (isError || !essay) {
    return (
      <div className="max-w-content mx-auto px-6 py-12 text-center">
        <p className="text-text-secondary">杂谈不存在。</p>
      </div>
    )
  }

  return (
    <>
      <ProgressBar />
      <article className="max-w-content mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-2xl font-bold text-text-primary mb-4">{essay.title}</h1>
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <span className="text-accent-red">●</span>
            {formatDateWithDot(essay.publishedAt)}
            <span>{essay.readingTime} min read</span>
          </div>
        </header>
        <MarkdownRenderer content={essay.content} />
        <Divider />
      </article>
    </>
  )
}
