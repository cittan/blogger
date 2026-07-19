'use client'

import { use } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useWikiCategories } from '@/hooks/useApi'

export const runtime = 'edge'

export default function WikiCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params)
  const { data: categories, isLoading, isError } = useWikiCategories()
  const cat = categories?.find((c) => c.category === category)

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (isError || !cat) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-text-secondary">分类不存在。</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-2 capitalize">{category}</h1>
      <p className="text-sm text-text-secondary mb-8">{cat.count} 个页面</p>
      <div className="space-y-2">
        {cat.pages.map((p) => (
          <Link key={p.slug} href={`/wiki/${category}/${p.slug}`}>
            <Card padding="md" hover>
              <h2 className="text-sm font-bold text-text-primary hover:text-accent-red transition-colors">{p.title}</h2>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
