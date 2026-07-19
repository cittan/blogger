import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/server/db'
import { EssaysRepository } from '@/server/repositories/essays'
import { EssaysService } from '@/server/services/essays'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const db = getDB()
  if (!db) {
    return NextResponse.json({
      success: true,
      data: { items: [], nextCursor: null, hasMore: false },
    })
  }

  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor') ?? undefined
  const limit = parseInt(searchParams.get('limit') ?? '10', 10)

  try {
    const repo = new EssaysRepository(db)
    const service = new EssaysService(repo)
    const result = await service.listEssays({ cursor, limit })
    return NextResponse.json({ success: true, data: result })
  } catch {
    return NextResponse.json({
      success: true,
      data: { items: [], nextCursor: null, hasMore: false },
    })
  }
}
