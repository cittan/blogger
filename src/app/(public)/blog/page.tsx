import { BlogList } from '@/components/blog/BlogList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '博客',
  description: '技术 · 生活 · 动漫',
}

export const runtime = 'edge'

export default function BlogPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-2">博客</h1>
      <p className="text-sm text-text-secondary mb-8">技术 · 生活 · 动漫</p>

      <BlogList />
    </div>
  )
}
