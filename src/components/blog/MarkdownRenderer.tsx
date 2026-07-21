import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

export async function MarkdownRenderer({ content }: { content: string }) {
  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypeStringify)
    .process(content)

  return (
    <article
      className="prose prose-invert max-w-none
        prose-headings:font-bold prose-headings:text-text-primary
        prose-h1:text-3xl prose-h1:mt-12 prose-h1:mb-6
        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
        prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-2
        prose-p:text-text-primary/85 prose-p:leading-[1.85]
        prose-a:text-accent-red prose-a:no-underline hover:prose-a:underline
        prose-strong:text-text-primary
        prose-blockquote:border-l-accent-red prose-blockquote:text-text-secondary prose-blockquote:not-italic
        prose-li:text-text-primary/85
        prose-code:font-mono prose-code:text-accent-amber
        prose-img:rounded-journal"
      dangerouslySetInnerHTML={{ __html: processedContent.toString() }}
    />
  )
}
