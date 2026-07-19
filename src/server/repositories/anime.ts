import type { Anime } from '@/types'

export class AnimeRepository {
  constructor(private db: D1Database) {}

  async list(status?: string): Promise<Anime[]> {
    let query = `SELECT id, title, slug, cover, season, year, status,
                 progress, total_episodes as totalEpisodes, notes, rating,
                 created_at as createdAt, updated_at as updatedAt
                 FROM anime`
    if (status) {
      const result = await this.db
        .prepare(query + ' WHERE status = ? ORDER BY year DESC, season DESC')
        .bind(status)
        .all<Anime>()
      return result.results
    }
    const result = await this.db
      .prepare(query + ' ORDER BY year DESC, season DESC')
      .all<Anime>()
    return result.results
  }

  async getBySlug(slug: string): Promise<Anime | null> {
    return this.db
      .prepare(
        `SELECT id, title, slug, cover, season, year, status,
         progress, total_episodes as totalEpisodes, notes, rating,
         created_at as createdAt, updated_at as updatedAt
         FROM anime WHERE slug = ?`
      )
      .bind(slug)
      .first<Anime>()
  }

  async create(input: Omit<Anime, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const result = await this.db
      .prepare(
        `INSERT INTO anime (title, slug, cover, season, year, status, progress, total_episodes, notes, rating)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        input.title, input.slug, input.cover, input.season, input.year,
        input.status, input.progress, input.totalEpisodes, input.notes, input.rating
      )
      .run()
    return (result.meta as any).last_row_id
  }

  async update(slug: string, input: Partial<Anime>): Promise<void> {
    const sets: string[] = []
    const bindings: any[] = []
    if (input.title !== undefined) { sets.push('title = ?'); bindings.push(input.title) }
    if (input.cover !== undefined) { sets.push('cover = ?'); bindings.push(input.cover) }
    if (input.season !== undefined) { sets.push('season = ?'); bindings.push(input.season) }
    if (input.year !== undefined) { sets.push('year = ?'); bindings.push(input.year) }
    if (input.status !== undefined) { sets.push('status = ?'); bindings.push(input.status) }
    if (input.progress !== undefined) { sets.push('progress = ?'); bindings.push(input.progress) }
    if (input.totalEpisodes !== undefined) { sets.push('total_episodes = ?'); bindings.push(input.totalEpisodes) }
    if (input.notes !== undefined) { sets.push('notes = ?'); bindings.push(input.notes) }
    if (input.rating !== undefined) { sets.push('rating = ?'); bindings.push(input.rating) }
    if (sets.length === 0) return
    sets.push("updated_at = datetime('now')")
    bindings.push(slug)
    await this.db
      .prepare(`UPDATE anime SET ${sets.join(', ')} WHERE slug = ?`)
      .bind(...bindings)
      .run()
  }

  async delete(slug: string): Promise<void> {
    await this.db.prepare('DELETE FROM anime WHERE slug = ?').bind(slug).run()
  }
}
