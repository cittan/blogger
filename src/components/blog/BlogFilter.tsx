'use client'

import { useState } from 'react'
import { PostCard, PostCardSkeleton } from './PostCard'
import { CategoryFilter } from './CategoryFilter'
import type { PostListItem } from '@/types'

export function BlogFilter({ initialPosts }: { initialPosts: PostListItem[] }) {
  const [category, setCategory] = useState('')

  const filtered = category
    ? initialPosts.filter((p) => p.category === category)
    : initialPosts

  return (
    <>
      <div className="mb-8">
        <CategoryFilter selected={category} onSelect={setCategory} />
      </div>

      <div className="space-y-6">
        {initialPosts.length === 0 ? (
          <p className="text-sm text-text-secondary">还没有文章。</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-text-secondary">该分类下没有文章。</p>
        ) : (
          filtered.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </>
  )
}
