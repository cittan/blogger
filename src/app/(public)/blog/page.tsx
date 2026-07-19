import { PostCard } from '@/components/blog/PostCard'
import { BlogFilter } from '@/components/blog/BlogFilter'
import { getDB } from '@/server/db'
import { PostsRepository } from '@/server/repositories/posts'
import type { PostListItem } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '博客',
  description: '技术 · 生活 · 动漫',
}

export const runtime = 'edge'

async function getPosts(): Promise<PostListItem[]> {
  const db = getDB()
  if (!db) return []
  try {
    const repo = new PostsRepository(db)
    const result = await repo.list({ limit: 50 })
    return result.items
  } catch {
    return []
  }
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-2">博客</h1>
      <p className="text-sm text-text-secondary mb-8">技术 · 生活 · 动漫</p>

      <BlogFilter initialPosts={posts} />
    </div>
  )
}
