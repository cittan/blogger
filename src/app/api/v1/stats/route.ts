import { NextResponse } from 'next/server'
import { getDB } from '@/server/db'
import { StatsService } from '@/server/services/stats'

export const runtime = 'edge'

export async function GET() {
  const db = getDB()
  if (!db) {
    return NextResponse.json({
      success: true,
      data: { totalViews: 0, totalPosts: 0, recentPosts: [], popularPosts: [] },
    })
  }

  try {
    const service = new StatsService(db)
    const stats = await service.getStats()
    return NextResponse.json({ success: true, data: stats })
  } catch {
    return NextResponse.json({
      success: true,
      data: { totalViews: 0, totalPosts: 0, recentPosts: [], popularPosts: [] },
    })
  }
}
