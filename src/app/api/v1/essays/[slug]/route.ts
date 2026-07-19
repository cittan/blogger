import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/server/db'
import { EssaysRepository } from '@/server/repositories/essays'
import { EssaysService } from '@/server/services/essays'

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
    const repo = new EssaysRepository(db)
    const service = new EssaysService(repo)
    const essay = await service.getEssay(slug)
    if (!essay) {
      return NextResponse.json({ success: false, error: { message: '随笔不存在' } }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: essay })
  } catch {
    return NextResponse.json({ success: false, error: { message: '获取随笔失败' } }, { status: 500 })
  }
}
