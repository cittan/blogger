import type { Post, PostListItem } from '@/types'

export class PostsRepository {
  constructor(private db: D1Database) {}

  async list(params: {
    cursor?: string
    limit?: number
    category?: string
    tag?: string
    keyword?: string
  }): Promise<{ items: PostListItem[]; nextCursor: string | null; hasMore: boolean }> {
    const limit = params.limit ?? 10
    const conditions: string[] = ['p.is_published = 1']
    const bindings: any[] = []

    if (params.cursor) {
      conditions.push('p.published_at < ?')
      bindings.push(params.cursor)
    }
    if (params.category) {
      conditions.push('p.category = ?')
      bindings.push(params.category)
    }
    if (params.keyword) {
      conditions.push('(p.title LIKE ? OR p.summary LIKE ?)')
      const kw = `%${params.keyword}%`
      bindings.push(kw, kw)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const result = await this.db
      .prepare(
        `SELECT p.id, p.title, p.slug, p.summary, p.cover, p.category, p.reading_time as readingTime,
                p.views, p.published_at as publishedAt
         FROM posts p
         ${where}
         ORDER BY p.published_at DESC
         LIMIT ?`
      )
      .bind(...bindings, limit + 1)
      .all<PostListItem>()

    const items = result.results.slice(0, limit)
    const hasMore = result.results.length > limit
    const nextCursor =
      hasMore && items.length > 0 ? items[items.length - 1].publishedAt : null

    if (items.length > 0) {
      const placeholders = items.map(() => '?').join(',')
      const ids = items.map((i) => i.id)
      const tagsResult = await this.db
        .prepare(`SELECT post_id, name FROM post_tags WHERE post_id IN (${placeholders})`)
        .bind(...ids)
        .all<{ post_id: number; name: string }>()

      const tagMap = new Map<number, string[]>()
      for (const row of tagsResult.results) {
        if (!tagMap.has(row.post_id)) tagMap.set(row.post_id, [])
        tagMap.get(row.post_id)!.push(row.name)
      }
      for (const item of items) {
        ;(item as any).tags = tagMap.get(item.id) ?? []
      }
    }

    return { items, nextCursor, hasMore }
  }

  async getBySlug(slug: string): Promise<Post | null> {
    const result = await this.db
      .prepare(
        `SELECT id, title, slug, summary, content, cover, category,
                reading_time as readingTime, views, is_published as isPublished,
                published_at as publishedAt, created_at as createdAt, updated_at as updatedAt
         FROM posts WHERE slug = ? AND is_published = 1`
      )
      .bind(slug)
      .first<Omit<Post, 'tags'>>()

    if (!result) return null

    const tagsResult = await this.db
      .prepare('SELECT name FROM post_tags WHERE post_id = ?')
      .bind(result.id)
      .all<{ name: string }>()

    return { ...result, tags: tagsResult.results.map((r) => r.name) }
  }

  async incrementViews(slug: string): Promise<void> {
    await this.db
      .prepare('UPDATE posts SET views = views + 1 WHERE slug = ?')
      .bind(slug)
      .run()
  }

  async create(input: {
    title: string
    slug: string
    summary: string
    content: string
    cover: string
    category: string
    tags: string[]
    readingTime: number
    isPublished: boolean
  }): Promise<Pick<Post, 'id' | 'slug'>> {
    const publishedAt = input.isPublished ? new Date().toISOString() : null
    const result = await this.db
      .prepare(
        `INSERT INTO posts (title, slug, summary, content, cover, category,
         reading_time, is_published, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        input.title,
        input.slug,
        input.summary,
        input.content,
        input.cover,
        input.category,
        input.readingTime,
        input.isPublished ? 1 : 0,
        publishedAt
      )
      .run()

    const id = (result.meta as any).last_row_id

    if (input.tags.length > 0) {
      const stmt = this.db.prepare(
        'INSERT OR IGNORE INTO post_tags (post_id, name) VALUES (?, ?)'
      )
      await Promise.all(input.tags.map((tag) => stmt.bind(id, tag).run()))
    }

    return { id, slug: input.slug }
  }

  async update(
    slug: string,
    input: Partial<{
      title: string
      summary: string
      content: string
      cover: string
      category: string
      tags: string[]
      readingTime: number
      isPublished: boolean
    }>
  ): Promise<void> {
    const sets: string[] = []
    const bindings: any[] = []

    if (input.title !== undefined) {
      sets.push('title = ?')
      bindings.push(input.title)
    }
    if (input.summary !== undefined) {
      sets.push('summary = ?')
      bindings.push(input.summary)
    }
    if (input.content !== undefined) {
      sets.push('content = ?')
      bindings.push(input.content)
    }
    if (input.cover !== undefined) {
      sets.push('cover = ?')
      bindings.push(input.cover)
    }
    if (input.category !== undefined) {
      sets.push('category = ?')
      bindings.push(input.category)
    }
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
    sets.push("updated_at = datetime('now')")

    if (sets.length > 0) {
      bindings.push(slug)
      await this.db
        .prepare(`UPDATE posts SET ${sets.join(', ')} WHERE slug = ?`)
        .bind(...bindings)
        .run()
    }

    if (input.tags !== undefined) {
      const post = await this.db
        .prepare('SELECT id FROM posts WHERE slug = ?')
        .bind(slug)
        .first<{ id: number }>()
      if (post) {
        await this.db.prepare('DELETE FROM post_tags WHERE post_id = ?').bind(post.id).run()
        const stmt = this.db.prepare(
          'INSERT OR IGNORE INTO post_tags (post_id, name) VALUES (?, ?)'
        )
        await Promise.all(input.tags.map((tag) => stmt.bind(post.id, tag).run()))
      }
    }
  }

  async delete(slug: string): Promise<void> {
    const post = await this.db
      .prepare('SELECT id FROM posts WHERE slug = ?')
      .bind(slug)
      .first<{ id: number }>()
    if (post) {
      await this.db.prepare('DELETE FROM post_tags WHERE post_id = ?').bind(post.id).run()
      await this.db.prepare('DELETE FROM posts WHERE id = ?').bind(post.id).run()
    }
  }
}
