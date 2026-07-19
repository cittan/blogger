import type { Essay } from '@/types'

export class EssaysRepository {
  constructor(private db: D1Database) {}

  async list(params: {
    cursor?: string
    limit?: number
  }): Promise<{ items: Essay[]; nextCursor: string | null; hasMore: boolean }> {
    const limit = params.limit ?? 10
    const bindings: any[] = []

    let where = 'WHERE is_published = 1'
    if (params.cursor) {
      where += ' AND created_at < ?'
      bindings.push(params.cursor)
    }

    bindings.push(limit + 1)
    const result = await this.db
      .prepare(
        `SELECT id, title, slug, summary, content, reading_time as readingTime,
                is_published as isPublished, published_at as publishedAt,
                created_at as createdAt, updated_at as updatedAt
         FROM essays ${where} ORDER BY created_at DESC LIMIT ?`
      )
      .bind(...bindings)
      .all<Essay>()

    const items = result.results.slice(0, limit)
    const hasMore = result.results.length > limit
    const nextCursor =
      hasMore && items.length > 0 ? items[items.length - 1].createdAt : null
    return { items, nextCursor, hasMore }
  }

  async getBySlug(slug: string): Promise<Essay | null> {
    return this.db
      .prepare(
        `SELECT id, title, slug, summary, content, reading_time as readingTime,
                is_published as isPublished, published_at as publishedAt,
                created_at as createdAt, updated_at as updatedAt
         FROM essays WHERE slug = ? AND is_published = 1`
      )
      .bind(slug)
      .first<Essay>()
  }

  async create(input: {
    title: string
    slug: string
    summary: string
    content: string
    readingTime: number
  }): Promise<number> {
    const result = await this.db
      .prepare(
        'INSERT INTO essays (title, slug, summary, content, reading_time) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(input.title, input.slug, input.summary, input.content, input.readingTime)
      .run()
    return (result.meta as any).last_row_id
  }

  async update(
    slug: string,
    input: Partial<{
      title: string
      summary: string
      content: string
      readingTime: number
      isPublished: boolean
    }>
  ): Promise<void> {
    const sets: string[] = []
    const bindings: any[] = []
    if (input.title !== undefined) { sets.push('title = ?'); bindings.push(input.title) }
    if (input.summary !== undefined) { sets.push('summary = ?'); bindings.push(input.summary) }
    if (input.content !== undefined) { sets.push('content = ?'); bindings.push(input.content) }
    if (input.readingTime !== undefined) {
      sets.push('reading_time = ?')
      bindings.push(input.readingTime)
    }
    if (input.isPublished !== undefined) {
      sets.push('is_published = ?')
      bindings.push(input.isPublished ? 1 : 0)
      if (input.isPublished) {
        sets.push('published_at = COALESCE(published_at, ?)')
        bindings.push(new Date().toISOString())
      }
    }
    if (sets.length === 0) return
    sets.push("updated_at = datetime('now')")
    bindings.push(slug)
    await this.db
      .prepare(`UPDATE essays SET ${sets.join(', ')} WHERE slug = ?`)
      .bind(...bindings)
      .run()
  }

  async delete(slug: string): Promise<void> {
    await this.db.prepare('DELETE FROM essays WHERE slug = ?').bind(slug).run()
  }
}
