import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/server/db'
import { AnimeRepository } from '@/server/repositories/anime'

export const runtime = 'edge'

/** GET — 获取单个追番记录 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const db = getDB()
  if (!db) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '数据库未连接' } },
      { status: 500 }
    )
  }

  const repo = new AnimeRepository(db)

  try {
    const anime = await repo.getBySlug(slug)
    if (!anime) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '追番记录不存在' } },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: anime })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '获取追番记录失败' } },
      { status: 500 }
    )
  }
}
