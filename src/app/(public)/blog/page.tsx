import { BlogFilter } from '@/components/blog/BlogFilter'
import { headers } from 'next/headers'
import type { PostListItem } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '博客',
  description: '技术 · 生活 · 动漫',
}

export const runtime = 'edge'

export default async function BlogPage() {
  let posts: PostListItem[] = []

  try {
    const headersList = await headers()
    const host = headersList.get('host') || ''
    const proto = host.includes('localhost') ? 'http' : 'https'
    const res = await fetch(`${proto}://${host}/api/v1/posts?limit=50`, { next: { revalidate: 60 } })
    const json = (await res.json()) as { success: boolean; data: { items: PostListItem[] } }
    if (json.success) {
      posts = json.data.items
    }
  } catch {
    // show empty list on error
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-2">博客</h1>
      <p className="text-sm text-text-secondary mb-8">技术 · 生活 · 动漫</p>

      <BlogFilter initialPosts={posts} />
    </div>
  )
}
