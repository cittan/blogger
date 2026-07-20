import { EssaysRepository } from '@/server/repositories/essays'
import { calculateReadingTime } from '@/utils/readingTime'

export class EssaysService {
  constructor(private repo: EssaysRepository) {}

  async listEssays(params: { cursor?: string; limit?: number }) {
    return this.repo.list(params)
  }
  async getEssay(slug: string) { return this.repo.getBySlug(slug) }
  async createEssay(input: {
    title: string
    slug: string
    summary?: string
    cover?: string
    content: string
  }) {
    return this.repo.create({
      ...input,
      summary: input.summary ?? '',
      readingTime: calculateReadingTime(input.content),
    })
  }
  async updateEssay(
    slug: string,
    input: { title?: string; summary?: string; cover?: string; content?: string; isPublished?: boolean }
  ) {
    const data: any = { ...input }
    if (input.content) data.readingTime = calculateReadingTime(input.content)
    return this.repo.update(slug, data)
  }
  async deleteEssay(slug: string) { return this.repo.delete(slug) }
}
