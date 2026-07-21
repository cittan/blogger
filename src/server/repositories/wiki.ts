import type { WikiPage, WikiPageListItem, WikiCategory, WikiCategoryTree } from '@/types'

interface CategoryRow {
  id: number
  name: string
  slug: string
  parent_id: number | null
  sort_order: number
  created_at: string
  updated_at: string
}

interface PageRow {
  id: number
  title: string
  slug: string
  cover: string
  category_id: number
  content: string
  is_published: number
  created_at: string
  updated_at: string
}

function toCategory(row: CategoryRow): WikiCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    parentId: row.parent_id,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toPage(row: PageRow): WikiPage {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    cover: row.cover,
    categoryId: row.category_id,
    content: row.content,
    isPublished: row.is_published === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toPageListItem(row: PageRow): WikiPageListItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    categoryId: row.category_id,
    isPublished: row.is_published === 1,
    updatedAt: row.updated_at,
  }
}

export class WikiRepository {
  constructor(private db: D1Database) {}

  // ========== 分类管理 ==========

  async getAllCategories(): Promise<WikiCategory[]> {
    const result = await this.db
      .prepare(
        `SELECT id, name, slug, parent_id, sort_order, created_at, updated_at
         FROM wiki_categories ORDER BY sort_order, id`
      )
      .all<CategoryRow>()
    return result.results.map(toCategory)
  }

  async getCategoryById(id: number): Promise<WikiCategory | null> {
    const row = await this.db
      .prepare(
        `SELECT id, name, slug, parent_id, sort_order, created_at, updated_at
         FROM wiki_categories WHERE id = ?`
      )
      .bind(id)
      .first<CategoryRow>()
    return row ? toCategory(row) : null
  }

  async getCategoryBySlug(slug: string): Promise<WikiCategory | null> {
    const row = await this.db
      .prepare(
        `SELECT id, name, slug, parent_id, sort_order, created_at, updated_at
         FROM wiki_categories WHERE slug = ?`
      )
      .bind(slug)
      .first<CategoryRow>()
    return row ? toCategory(row) : null
  }

  async createCategory(input: {
    name: string
    slug: string
    parentId?: number | null
    sortOrder?: number
  }): Promise<number> {
    const result = await this.db
      .prepare(
        'INSERT INTO wiki_categories (name, slug, parent_id, sort_order) VALUES (?, ?, ?, ?)'
      )
      .bind(input.name, input.slug, input.parentId ?? null, input.sortOrder ?? 0)
      .run()
    return (result.meta as any).last_row_id
  }

  async updateCategory(
    id: number,
    input: { name?: string; slug?: string; parentId?: number | null; sortOrder?: number }
  ): Promise<void> {
    const sets: string[] = []
    const bindings: any[] = []
    if (input.name !== undefined) {
      sets.push('name = ?')
      bindings.push(input.name)
    }
    if (input.slug !== undefined) {
      sets.push('slug = ?')
      bindings.push(input.slug)
    }
    if (input.parentId !== undefined) {
      sets.push('parent_id = ?')
      bindings.push(input.parentId)
    }
    if (input.sortOrder !== undefined) {
      sets.push('sort_order = ?')
      bindings.push(input.sortOrder)
    }
    if (sets.length === 0) return
    sets.push("updated_at = datetime('now')")
    bindings.push(id)
    await this.db
      .prepare(`UPDATE wiki_categories SET ${sets.join(', ')} WHERE id = ?`)
      .bind(...bindings)
      .run()
  }

  async deleteCategory(id: number): Promise<void> {
    // 将子分类的 parent_id 置为 null
    await this.db
      .prepare('UPDATE wiki_categories SET parent_id = NULL WHERE parent_id = ?')
      .bind(id)
      .run()
    // 将该分类下的页面也解除关联
    await this.db
      .prepare('UPDATE wiki_pages SET category_id = NULL WHERE category_id = ?')
      .bind(id)
      .run()
    await this.db
      .prepare('DELETE FROM wiki_categories WHERE id = ?')
      .bind(id)
      .run()
  }

  // ========== 分类树 ==========

  async getCategoryTree(): Promise<WikiCategoryTree[]> {
    const categories = await this.getAllCategories()
    const pagesResult = await this.db
      .prepare(
        `SELECT id, title, slug, cover, category_id, content, is_published, created_at, updated_at
         FROM wiki_pages WHERE is_published = 1 ORDER BY updated_at DESC`
      )
      .all<PageRow>()

    const pagesByCategory = new Map<number, WikiPageListItem[]>()
    for (const row of pagesResult.results) {
      const list = pagesByCategory.get(row.category_id) ?? []
      list.push(toPageListItem(row))
      pagesByCategory.set(row.category_id, list)
    }

    const nodeMap = new Map<number, WikiCategoryTree>()
    for (const cat of categories) {
      nodeMap.set(cat.id, { ...cat, children: [], pages: pagesByCategory.get(cat.id) ?? [] })
    }

    const roots: WikiCategoryTree[] = []
    for (const cat of categories) {
      const node = nodeMap.get(cat.id)!
      if (cat.parentId && nodeMap.has(cat.parentId)) {
        nodeMap.get(cat.parentId)!.children.push(node)
      } else {
        roots.push(node)
      }
    }
    return roots
  }

  // ========== 页面管理 ==========

  async getPages(params?: {
    categoryId?: number
    isPublished?: boolean
    keyword?: string
    limit?: number
    offset?: number
  }): Promise<{ items: WikiPageListItem[]; total: number }> {
    const conditions: string[] = []
    const bindings: any[] = []

    if (params?.categoryId !== undefined) {
      conditions.push('category_id = ?')
      bindings.push(params.categoryId)
    }
    if (params?.isPublished !== undefined) {
      conditions.push('is_published = ?')
      bindings.push(params.isPublished ? 1 : 0)
    }
    if (params?.keyword) {
      conditions.push('(title LIKE ? OR content LIKE ?)')
      bindings.push(`%${params.keyword}%`, `%${params.keyword}%`)
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const limit = params?.limit ?? 20
    const offset = params?.offset ?? 0

    const [countResult, dataResult] = await Promise.all([
      this.db
        .prepare(`SELECT COUNT(*) as total FROM wiki_pages ${where}`)
        .bind(...bindings)
        .first<{ total: number }>(),
      this.db
        .prepare(
          `SELECT id, title, slug, cover, category_id, content, is_published, created_at, updated_at
           FROM wiki_pages ${where} ORDER BY updated_at DESC LIMIT ? OFFSET ?`
        )
        .bind(...bindings, limit, offset)
        .all<PageRow>(),
    ])

    return {
      items: dataResult.results.map(toPageListItem),
      total: countResult?.total ?? 0,
    }
  }

  async getPageById(id: number): Promise<WikiPage | null> {
    const row = await this.db
      .prepare(
        `SELECT id, title, slug, cover, category_id, content, is_published, created_at, updated_at
         FROM wiki_pages WHERE id = ?`
      )
      .bind(id)
      .first<PageRow>()
    return row ? toPage(row) : null
  }

  async getPageBySlug(slug: string): Promise<WikiPage | null> {
    const row = await this.db
      .prepare(
        `SELECT id, title, slug, cover, category_id, content, is_published, created_at, updated_at
         FROM wiki_pages WHERE slug = ? AND is_published = 1`
      )
      .bind(slug)
      .first<PageRow>()
    return row ? toPage(row) : null
  }

  async createPage(input: {
    title: string
    slug: string
    cover?: string
    categoryId?: number | null
    content: string
    isPublished?: boolean
  }): Promise<number> {
    const result = await this.db
      .prepare(
        `INSERT INTO wiki_pages (title, slug, cover, category_id, content, is_published)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(
        input.title,
        input.slug,
        input.cover ?? '',
        input.categoryId ?? null,
        input.content,
        input.isPublished ? 1 : 0
      )
      .run()
    return (result.meta as any).last_row_id
  }

  async updatePage(
    id: number,
    input: {
      title?: string
      slug?: string
      cover?: string
      categoryId?: number | null
      content?: string
      isPublished?: boolean
    }
  ): Promise<void> {
    const sets: string[] = []
    const bindings: any[] = []
    if (input.title !== undefined) {
      sets.push('title = ?')
      bindings.push(input.title)
    }
    if (input.slug !== undefined) {
      sets.push('slug = ?')
      bindings.push(input.slug)
    }
    if (input.cover !== undefined) {
      sets.push('cover = ?')
      bindings.push(input.cover)
    }
    if (input.categoryId !== undefined) {
      sets.push('category_id = ?')
      bindings.push(input.categoryId)
    }
    if (input.content !== undefined) {
      sets.push('content = ?')
      bindings.push(input.content)
    }
    if (input.isPublished !== undefined) {
      sets.push('is_published = ?')
      bindings.push(input.isPublished ? 1 : 0)
    }
    if (sets.length === 0) return
    sets.push("updated_at = datetime('now')")
    bindings.push(id)
    await this.db
      .prepare(`UPDATE wiki_pages SET ${sets.join(', ')} WHERE id = ?`)
      .bind(...bindings)
      .run()
  }

  async deletePage(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM wiki_pages WHERE id = ?').bind(id).run()
  }

  // ========== 搜索 ==========

  async searchPages(params: {
    keyword: string
    isPublished?: boolean
    limit?: number
    offset?: number
  }): Promise<{ items: WikiPageListItem[]; total: number }> {
    const conditions: string[] = []
    const bindings: any[] = []

    if (params.keyword) {
      conditions.push('(title LIKE ? OR content LIKE ?)')
      bindings.push(`%${params.keyword}%`, `%${params.keyword}%`)
    }
    if (params.isPublished !== undefined) {
      conditions.push('is_published = ?')
      bindings.push(params.isPublished ? 1 : 0)
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const limit = params.limit ?? 20
    const offset = params.offset ?? 0

    const [countResult, dataResult] = await Promise.all([
      this.db
        .prepare(`SELECT COUNT(*) as total FROM wiki_pages ${where}`)
        .bind(...bindings)
        .first<{ total: number }>(),
      this.db
        .prepare(
          `SELECT id, title, slug, cover, category_id, content, is_published, created_at, updated_at
           FROM wiki_pages ${where} ORDER BY updated_at DESC LIMIT ? OFFSET ?`
        )
        .bind(...bindings, limit, offset)
        .all<PageRow>(),
    ])

    return {
      items: dataResult.results.map(toPageListItem),
      total: countResult?.total ?? 0,
    }
  }
}
