import { FriendsRepository } from '@/server/repositories/friends'

export class FriendsService {
  constructor(private repo: FriendsRepository) {}
  async listFriends() { return this.repo.list() }
  async createFriend(input: Parameters<FriendsRepository['create']>[0]) {
    return this.repo.create(input)
  }
  async updateFriend(id: number, input: Parameters<FriendsRepository['update']>[1]) {
    return this.repo.update(id, input)
  }
  async deleteFriend(id: number) { return this.repo.delete(id) }
}
