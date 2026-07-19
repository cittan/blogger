export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <article
      className="prose prose-invert max-w-none
        prose-headings:font-bold prose-headings:text-text-primary
        prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
        prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
        prose-p:text-text-primary/85 prose-p:leading-[1.85]
        prose-a:text-accent-red prose-a:no-underline hover:prose-a:underline
        prose-strong:text-text-primary
        prose-blockquote:border-l-accent-red prose-blockquote:text-text-secondary prose-blockquote:not-italic
        prose-li:text-text-primary/85
        prose-code:font-mono prose-code:text-accent-amber
        prose-img:rounded-journal"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
