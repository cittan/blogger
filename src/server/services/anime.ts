import { AnimeRepository } from '@/server/repositories/anime'

export class AnimeService {
  constructor(private repo: AnimeRepository) {}

  async listAnime(status?: string) { return this.repo.list(status) }
  async getAnime(slug: string) { return this.repo.getBySlug(slug) }
  async createAnime(input: Parameters<AnimeRepository['create']>[0]) {
    return this.repo.create(input)
  }
  async updateAnime(slug: string, input: Parameters<AnimeRepository['update']>[1]) {
    return this.repo.update(slug, input)
  }
  async deleteAnime(slug: string) { return this.repo.delete(slug) }
}
