import { PostsRepository } from '@/server/repositories/posts'
import { calculateReadingTime } from '@/utils/readingTime'

export class PostsService {
  constructor(private repo: PostsRepository) {}

  async listPosts(params: {
    cursor?: string
    limit?: number
    category?: string
    tag?: string
    keyword?: string
  }) {
    return this.repo.list(params)
  }

  async getPost(slug: string) {
    await this.repo.incrementViews(slug).catch(() => {})
    return this.repo.getBySlug(slug)
  }

  async createPost(input: {
    title: string
    slug: string
    summary?: string
    content: string
    cover?: string
    category: string
    tags: string[]
    isPublished?: boolean
  }) {
    const readingTime = calculateReadingTime(input.content)
    return this.repo.create({
      ...input,
      summary: input.summary ?? '',
      cover: input.cover ?? '',
      readingTime,
      isPublished: input.isPublished ?? false,
    })
  }

  async updatePost(
    slug: string,
    input: {
      title?: string
      summary?: string
      content?: string
      cover?: string
      category?: string
      tags?: string[]
      isPublished?: boolean
    }
  ) {
    const updateData: any = { ...input }
    if (input.content) {
      updateData.readingTime = calculateReadingTime(input.content)
    }
    return this.repo.update(slug, updateData)
  }

  async deletePost(slug: string) {
    return this.repo.delete(slug)
  }

  async listAllPosts(params: {
    cursor?: string
    limit?: number
    category?: string
    keyword?: string
  }) {
    return this.repo.listAll(params)
  }

  async togglePin(slug: string) {
    return this.repo.togglePin(slug)
  }
}
