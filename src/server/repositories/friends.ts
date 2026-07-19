import type { Friend } from '@/types'

export class FriendsRepository {
  constructor(private db: D1Database) {}

  async list(): Promise<Friend[]> {
    const result = await this.db
      .prepare(
        'SELECT id, name, url, avatar, description, sort_order as sortOrder, created_at as createdAt FROM friends ORDER BY sort_order'
      )
      .all<Friend>()
    return result.results
  }

  async create(input: {
    name: string
    url: string
    avatar?: string
    description?: string
  }): Promise<number> {
    const result = await this.db
      .prepare(
        'INSERT INTO friends (name, url, avatar, description) VALUES (?, ?, ?, ?)'
      )
      .bind(input.name, input.url, input.avatar ?? '', input.description ?? '')
      .run()
    return (result.meta as any).last_row_id
  }

  async update(id: number, input: Partial<Friend>): Promise<void> {
    const sets: string[] = []
    const bindings: any[] = []
    if (input.name !== undefined) { sets.push('name = ?'); bindings.push(input.name) }
    if (input.url !== undefined) { sets.push('url = ?'); bindings.push(input.url) }
    if (input.avatar !== undefined) { sets.push('avatar = ?'); bindings.push(input.avatar) }
    if (input.description !== undefined) { sets.push('description = ?'); bindings.push(input.description) }
    if (input.sortOrder !== undefined) { sets.push('sort_order = ?'); bindings.push(input.sortOrder) }
    if (sets.length === 0) return
    bindings.push(id)
    await this.db
      .prepare(`UPDATE friends SET ${sets.join(', ')} WHERE id = ?`)
      .bind(...bindings)
      .run()
  }

  async delete(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM friends WHERE id = ?').bind(id).run()
  }
}
