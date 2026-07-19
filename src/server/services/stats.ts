import type { SiteStats } from '@/types'

export class StatsService {
  constructor(private db: D1Database) {}

  async getStats(): Promise<SiteStats> {
    const totalPosts = await this.db
      .prepare('SELECT COUNT(*) as count FROM posts WHERE is_published = 1')
      .first<{ count: number }>()

    const totalViews = await this.db
      .prepare('SELECT COALESCE(SUM(views), 0) as total FROM posts WHERE is_published = 1')
      .first<{ total: number }>()

    const recentPosts = await this.db
      .prepare(
        `SELECT id, title, slug, summary, category, reading_time as readingTime, views, published_at as publishedAt
         FROM posts WHERE is_published = 1 ORDER BY published_at DESC LIMIT 5`
      )
      .all()

    const popularPosts = await this.db
      .prepare(
        `SELECT id, title, slug, summary, category, reading_time as readingTime, views, published_at as publishedAt
         FROM posts WHERE is_published = 1 ORDER BY views DESC LIMIT 5`
      )
      .all()

    return {
      totalViews: totalViews?.total ?? 0,
      totalPosts: totalPosts?.count ?? 0,
      recentPosts: recentPosts.results as any[],
      popularPosts: popularPosts.results as any[],
    }
  }
}
