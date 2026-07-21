import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/server/db'
import { WikiRepository } from '@/server/repositories/wiki'
import { WikiService } from '@/server/services/wiki'

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const db = getDB()
  if (!db) {
    return NextResponse.json({ success: false, error: { message: '数据库未连接' } }, { status: 500 })
  }

  try {
    const repo = new WikiRepository(db)
    const service = new WikiService(repo)
    const page = await service.getPageBySlug(slug)
    if (!page) {
      return NextResponse.json({ success: false, error: { message: '页面不存在' } }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: page })
  } catch {
    return NextResponse.json({ success: false, error: { message: '获取页面失败' } }, { status: 500 })
  }
}
