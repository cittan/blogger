import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/server/db'
import { AnimeRepository } from '@/server/repositories/anime'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const db = getDB()
  if (!db) {
    return NextResponse.json({ success: true, data: [] })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? undefined

  try {
    const repo = new AnimeRepository(db)
    const items = await repo.list(status)
    return NextResponse.json({ success: true, data: items })
  } catch {
    return NextResponse.json({ success: true, data: [] })
  }
}
