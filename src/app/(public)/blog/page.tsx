'use client'

import { useState } from 'react'
import { PostCard, PostCardSkeleton } from '@/components/blog/PostCard'
import { CategoryFilter } from '@/components/blog/CategoryFilter'
import { usePosts } from '@/hooks/useApi'

export default function BlogPage() {
  const [category, setCategory] = useState('')
  const { data, isLoading, isError } = usePosts({ category: category || undefined, limit: 20 })

  const posts = data?.items ?? []

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-2">博客</h1>
      <p className="text-sm text-text-secondary mb-8">技术 · 生活 · 动漫</p>

      <div className="mb-8">
        <CategoryFilter selected={category} onSelect={setCategory} />
      </div>

      <div className="space-y-6">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <PostCardSkeleton key={i} />)
        ) : isError ? (
          <p className="text-sm text-accent-red">加载失败，请稍后重试。</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-text-secondary">还没有文章。</p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  )
}
