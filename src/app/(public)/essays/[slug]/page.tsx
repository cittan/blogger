import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer'
import { ProgressBar } from '@/components/blog/ProgressBar'
import { Divider } from '@/components/ui/Divider'

export default function EssayPage({ params }: { params: { slug: string } }) {
  return (
    <>
      <ProgressBar />
      <article className="max-w-content mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-2xl font-bold text-text-primary mb-4">{params.slug}</h1>
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <span className="text-accent-red">●</span>
          </div>
        </header>
        <MarkdownRenderer content={''} />
        <Divider />
      </article>
    </>
  )
}
