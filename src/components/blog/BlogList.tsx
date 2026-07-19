'use client'

import { useState, useEffect, useRef } from 'react'
import { useInfinitePosts } from '@/hooks/useApi'
import { PostCard, PostCardSkeleton } from './PostCard'
import { CategoryFilter } from './CategoryFilter'

export function BlogList() {
  const [category, setCategory] = useState('')
  const sentinelRef = useRef<HTMLDivElement>(null)

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfinitePosts({ limit: 20, category: category || undefined })

  // IntersectionObserver: trigger fetchNextPage when sentinel enters viewport
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const posts = data?.pages.flatMap((page) => page.items) ?? []

  if (isError) {
    return (
      <>
        <div className="mb-8">
          <CategoryFilter selected={category} onSelect={setCategory} />
        </div>
        <div className="text-center py-12">
          <p className="text-sm text-accent-red mb-3">
            {error instanceof Error ? error.message : '加载失败'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-1.5 text-xs rounded-full border border-accent-red/40 text-accent-red hover:bg-accent-red/5 transition-all"
          >
            重试
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="mb-8">
        <CategoryFilter selected={category} onSelect={setCategory} />
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-sm text-text-secondary">
          {category ? '该分类下没有文章。' : '还没有文章。'}
        </p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* Sentinel element for IntersectionObserver */}
          <div ref={sentinelRef} className="h-1" />

          {/* Loading more indicator */}
          {isFetchingNextPage && (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <PostCardSkeleton key={`loading-${i}`} />
              ))}
            </div>
          )}

          {/* No more posts */}
          {!hasNextPage && (
            <p className="text-center text-xs text-text-secondary/50 py-4">
              没有更多了
            </p>
          )}
        </div>
      )}
    </>
  )
}
