'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useWikiCategories } from '@/hooks/useApi'

export default function WikiPage() {
  const { data: categories, isLoading, isError } = useWikiCategories()
  const cats = categories ?? []

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-2">知识库</h1>
      <p className="text-sm text-text-secondary mb-10">笔记与知识整理</p>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-accent-red">加载失败。</p>
      ) : cats.length === 0 ? (
        <p className="text-sm text-text-secondary">还没有内容。</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cats.map((cat) => (
            <Link key={cat.category} href={`/wiki/${cat.category}`}>
              <Card padding="md" hover className="h-full">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-accent-teal text-xs">☰</span>
                  <h2 className="text-sm font-bold text-text-primary capitalize">{cat.category}</h2>
                </div>
                <p className="text-xs text-text-secondary/60 mb-3">{cat.count} 个页面</p>
                <ul className="space-y-1">
                  {cat.pages.slice(0, 5).map((p) => (
                    <li key={p.slug} className="text-xs text-text-secondary hover:text-accent-red transition-colors">
                      {p.title}
                    </li>
                  ))}
                </ul>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
