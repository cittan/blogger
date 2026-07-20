import type { WikiPage, WikiCategory } from '@/types'

export class WikiRepository {
  constructor(private db: D1Database) {}

  async getCategories(): Promise<WikiCategory[]> {
    const result = await this.db
      .prepare(
        `SELECT category, COUNT(*) as count FROM wiki_pages GROUP BY category ORDER BY category`
      )
      .all<{ category: string; count: number }>()

    const categories: WikiCategory[] = []
    for (const row of result.results) {
      const pages = await this.db
        .prepare('SELECT title, slug FROM wiki_pages WHERE category = ? ORDER BY title')
        .bind(row.category)
        .all<{ title: string; slug: string }>()
      categories.push({ category: row.category, pages: pages.results, count: row.count })
    }
    return categories
  }

  async getPage(category: string, slug: string): Promise<WikiPage | null> {
    return this.db
      .prepare(
        `SELECT id, title, slug, cover, category, content,
         created_at as createdAt, updated_at as updatedAt
         FROM wiki_pages WHERE category = ? AND slug = ?`
      )
      .bind(category, slug)
      .first<WikiPage>()
  }

  async create(input: {
    title: string
    slug: string
    cover?: string
    category: string
    content: string
  }): Promise<number> {
    const result = await this.db
      .prepare(
        'INSERT INTO wiki_pages (title, slug, cover, category, content) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(input.title, input.slug, input.cover ?? '', input.category, input.content)
      .run()
    return (result.meta as any).last_row_id
  }

  async update(
    category: string,
    slug: string,
    input: { title?: string; cover?: string; content?: string }
  ): Promise<void> {
    const sets: string[] = []
    const bindings: any[] = []
    if (input.title !== undefined) { sets.push('title = ?'); bindings.push(input.title) }
    if (input.cover !== undefined) { sets.push('cover = ?'); bindings.push(input.cover) }
    if (input.content !== undefined) { sets.push('content = ?'); bindings.push(input.content) }
    if (sets.length === 0) return
    sets.push("updated_at = datetime('now')")
    bindings.push(category, slug)
    await this.db
      .prepare(`UPDATE wiki_pages SET ${sets.join(', ')} WHERE category = ? AND slug = ?`)
      .bind(...bindings)
      .run()
  }

  async delete(category: string, slug: string): Promise<void> {
    await this.db
      .prepare('DELETE FROM wiki_pages WHERE category = ? AND slug = ?')
      .bind(category, slug)
      .run()
  }
}
