import { NextResponse } from 'next/server'
import { getDB } from '@/server/db'
import { FriendsRepository } from '@/server/repositories/friends'
import { FriendsService } from '@/server/services/friends'

export const runtime = 'edge'

export async function GET() {
  const db = getDB()
  if (!db) {
    return NextResponse.json({ success: true, data: [] })
  }

  try {
    const repo = new FriendsRepository(db)
    const service = new FriendsService(repo)
    const items = await service.listFriends()
    return NextResponse.json({ success: true, data: items })
  } catch {
    return NextResponse.json({ success: true, data: [] })
  }
}
