import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer'
import { ProgressBar } from '@/components/blog/ProgressBar'
import { PostNav } from '@/components/blog/PostNav'
import { Tag } from '@/components/ui/Tag'
import { Divider } from '@/components/ui/Divider'
import { formatDateWithDot } from '@/utils/date'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return { title: slug }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  return (
    <>
      <ProgressBar />
      <article className="max-w-content mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            {/* title */}
          </h1>
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <span className="text-accent-red">●</span>
            {/* date */}
            <span>{/* readingTime */} min read</span>
          </div>
          <div className="flex gap-1.5 mt-3">
            {/* tags */}
          </div>
        </header>

        <MarkdownRenderer content={''} />

        <Divider />
        <PostNav />
      </article>
    </>
  )
}
