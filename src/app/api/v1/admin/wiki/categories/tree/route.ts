import { NextResponse } from 'next/server'
import { getDB } from '@/server/db'
import { WikiRepository } from '@/server/repositories/wiki'
import { WikiService } from '@/server/services/wiki'

export const runtime = 'edge'

// GET /api/v1/admin/wiki/categories/tree - 获取分类树
export async function GET() {
  const db = getDB()
  if (!db) {
    return NextResponse.json({ success: false, error: { message: '数据库未连接' } }, { status: 500 })
  }

  try {
    const repo = new WikiRepository(db)
    const service = new WikiService(repo)
    const tree = await service.getCategoryTree()
    return NextResponse.json({ success: true, data: tree })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : '获取分类树失败' } },
      { status: 500 }
    )
  }
}
