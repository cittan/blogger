'use client'

import { use } from 'react'
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer'
import { Skeleton } from '@/components/ui/Skeleton'
import { useWikiPage } from '@/hooks/useApi'

export const runtime = 'edge'

export default function WikiDetailPage({ params }: { params: Promise<{ category: string; page: string }> }) {
  const { category, page } = use(params)
  const { data, isLoading, isError } = useWikiPage(category, page)

  if (isLoading) {
    return (
      <div className="max-w-content mx-auto">
        <Skeleton className="h-8 w-2/3 mb-8" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="max-w-content mx-auto text-center">
        <p className="text-text-secondary">页面不存在。</p>
      </div>
    )
  }

  return (
    <article className="max-w-content mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-8">{data.title}</h1>
      <MarkdownRenderer content={data.content} />
    </article>
  )
}
