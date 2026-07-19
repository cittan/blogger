import { WikiRepository } from '@/server/repositories/wiki'

export class WikiService {
  constructor(private repo: WikiRepository) {}
  async getCategories() { return this.repo.getCategories() }
  async getPage(category: string, slug: string) { return this.repo.getPage(category, slug) }
  async createPage(input: Parameters<WikiRepository['create']>[0]) {
    return this.repo.create(input)
  }
  async updatePage(
    category: string,
    slug: string,
    input: Parameters<WikiRepository['update']>[2]
  ) { return this.repo.update(category, slug, input) }
  async deletePage(category: string, slug: string) {
    return this.repo.delete(category, slug)
  }
}
