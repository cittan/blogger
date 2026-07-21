import { WikiRepository } from '@/server/repositories/wiki'

export class WikiService {
  constructor(private repo: WikiRepository) {}

  // ========== 分类管理 ==========

  async getAllCategories() {
    return this.repo.getAllCategories()
  }

  async getCategoryById(id: number) {
    return this.repo.getCategoryById(id)
  }

  async getCategoryBySlug(slug: string) {
    return this.repo.getCategoryBySlug(slug)
  }

  async createCategory(input: {
    name: string
    slug: string
    parentId?: number | null
    sortOrder?: number
  }) {
    // 检查 slug 是否已存在
    const existing = await this.repo.getCategoryBySlug(input.slug)
    if (existing) {
      throw new Error('分类标识已存在')
    }
    return this.repo.createCategory(input)
  }

  async updateCategory(
    id: number,
    input: { name?: string; slug?: string; parentId?: number | null; sortOrder?: number }
  ) {
    // 检查分类是否存在
    const existing = await this.repo.getCategoryById(id)
    if (!existing) {
      throw new Error('分类不存在')
    }
    // 如果修改 slug，检查是否与其他分类冲突
    if (input.slug && input.slug !== existing.slug) {
      const conflict = await this.repo.getCategoryBySlug(input.slug)
      if (conflict) {
        throw new Error('分类标识已存在')
      }
    }
    // 不能将分类设为自己的子分类
    if (input.parentId === id) {
      throw new Error('不能将分类设为自己的子分类')
    }
    return this.repo.updateCategory(id, input)
  }

  async deleteCategory(id: number) {
    const existing = await this.repo.getCategoryById(id)
    if (!existing) {
      throw new Error('分类不存在')
    }
    return this.repo.deleteCategory(id)
  }

  // ========== 分类树 ==========

  async getCategoryTree() {
    return this.repo.getCategoryTree()
  }

  // ========== 页面管理 ==========

  async getPages(params?: {
    categoryId?: number
    isPublished?: boolean
    keyword?: string
    limit?: number
    offset?: number
  }) {
    return this.repo.getPages(params)
  }

  async getPageById(id: number) {
    return this.repo.getPageById(id)
  }

  async getPageBySlug(slug: string) {
    return this.repo.getPageBySlug(slug)
  }

  async createPage(input: {
    title: string
    slug: string
    cover?: string
    categoryId?: number | null
    content: string
    isPublished?: boolean
  }) {
    // 检查 slug 是否已存在
    const existing = await this.repo.getPageBySlug(input.slug)
    if (existing) {
      throw new Error('页面标识已存在')
    }
    return this.repo.createPage(input)
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
  ) {
    const existing = await this.repo.getPageById(id)
    if (!existing) {
      throw new Error('页面不存在')
    }
    // 如果修改 slug，检查是否与其他页面冲突
    if (input.slug && input.slug !== existing.slug) {
      const conflict = await this.repo.getPageBySlug(input.slug)
      if (conflict) {
        throw new Error('页面标识已存在')
      }
    }
    return this.repo.updatePage(id, input)
  }

  async deletePage(id: number) {
    const existing = await this.repo.getPageById(id)
    if (!existing) {
      throw new Error('页面不存在')
    }
    return this.repo.deletePage(id)
  }

  // ========== 搜索 ==========

  async searchPages(params: {
    keyword: string
    isPublished?: boolean
    limit?: number
    offset?: number
  }) {
    return this.repo.searchPages(params)
  }
}
