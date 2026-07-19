import Link from 'next/link'

interface PostNavProps {
  prev?: { slug: string; title: string } | null
  next?: { slug: string; title: string } | null
}

export function PostNav({ prev, next }: PostNavProps) {
  if (!prev && !next) return null

  return (
    <nav className="flex justify-between gap-4 mt-12 pt-8 border-t border-text-secondary/5">
      {prev ? (
        <Link href={`/blog/${prev.slug}`} className="group text-left flex-1">
          <span className="text-xs text-text-secondary">← 上一篇</span>
          <p className="text-sm text-text-primary group-hover:text-accent-red transition-colors line-clamp-1">
            {prev.title}
          </p>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link href={`/blog/${next.slug}`} className="group text-right flex-1">
          <span className="text-xs text-text-secondary">下一篇 →</span>
          <p className="text-sm text-text-primary group-hover:text-accent-red transition-colors line-clamp-1">
            {next.title}
          </p>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  )
}
