import { getDB } from '@/server/db'
import { PostsRepository } from '@/server/repositories/posts'

export const runtime = 'edge'

const SITE = {
  title: 'cittan',
  url: 'https://cittan.blog',
  description: '只会vibe coding的fw一个',
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toRfc822(dateStr: string | null): string {
  if (!dateStr) return new Date().toUTCString()
  return new Date(dateStr).toUTCString()
}

async function generateRss(): Promise<string> {
  const db = getDB()

  let items = ''

  if (db) {
    const repo = new PostsRepository(db)
    const result = await repo.list({ limit: 50 })

    for (const post of result.items) {
      const link = `${SITE.url}/blog/${post.slug}`
      const pubDate = toRfc822(post.publishedAt)

      items += `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(post.summary || '')}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.title)}</title>
    <link>${escapeXml(SITE.url)}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>zh-CN</language>
    <atom:link href="${escapeXml(SITE.url)}/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`
}

export async function GET() {
  const xml = await generateRss()
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
