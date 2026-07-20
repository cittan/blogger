import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer'
import { ProgressBar } from '@/components/blog/ProgressBar'
import { PostNav } from '@/components/blog/PostNav'
import { Tag } from '@/components/ui/Tag'
import { Divider } from '@/components/ui/Divider'
import { formatDateWithDot } from '@/utils/date'
import { getCoverSrc } from '@/utils/image'
import { getDB } from '@/server/db'
import { PostsRepository } from '@/server/repositories/posts'
import { PostsService } from '@/server/services/posts'
import type { Post } from '@/types'
import type { Metadata } from 'next'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

async function getPostWithoutView(slug: string): Promise<Post | null> {
  const db = getDB()
  if (!db) return null
  try {
    const repo = new PostsRepository(db)
    return await repo.getBySlug(slug)
  } catch {
    return null
  }
}

async function getPostWithView(slug: string): Promise<Post | null> {
  const db = getDB()
  if (!db) return null
  try {
    const repo = new PostsRepository(db)
    const service = new PostsService(repo)
    return await service.getPost(slug)
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostWithoutView(slug)
  return {
    title: post?.title ?? slug,
    description: post?.summary ?? '',
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostWithView(slug)

  if (!post) {
    return (
      <div className="max-w-content mx-auto px-6 py-12 text-center">
        <p className="text-text-secondary">文章不存在或已被删除。</p>
      </div>
    )
  }

  const coverSrc = getCoverSrc(post.cover)
  return (
    <>
      <ProgressBar />
      <article className="max-w-content mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-2xl font-bold text-text-primary mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <span className="text-accent-red">●</span>
            {formatDateWithDot(post.publishedAt)}
            <span>{post.readingTime} min read</span>
          </div>
          <div className="flex gap-1.5 mt-3">
            {post.tags?.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </header>

        {coverSrc&&(<img src={coverSrc} alt={post.title} className="w-full rounded-journal mb-10 object-cover max-h-96"/>)}

        <MarkdownRenderer content={post.content} />

        <Divider />
        <PostNav />
      </article>
    </>
  )
}
