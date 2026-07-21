import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/server/db'
import { WikiRepository } from '@/server/repositories/wiki'
import { WikiService } from '@/server/services/wiki'
import { verifyAdmin } from '@/server/middleware/auth'

export const runtime = 'edge'

// GET /api/v1/admin/wiki/categories - 获取所有分类
export async function GET() {
  const db = getDB()
  if (!db) {
    return NextResponse.json({ success: false, error: { message: '数据库未连接' } }, { status: 500 })
  }

  try {
    const repo = new WikiRepository(db)
    const service = new WikiService(repo)
    const categories = await service.getAllCategories()
    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : '获取分类失败' } },
      { status: 500 }
    )
  }
}

// POST /api/v1/admin/wiki/categories - 创建分类
export async function POST(request: NextRequest) {
  const authError = await verifyAdmin(request)
  if (authError) return authError

  const db = getDB()
  if (!db) {
    return NextResponse.json({ success: false, error: { message: '数据库未连接' } }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { name, slug, parentId, sortOrder } = body

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: { message: '名称和标识不能为空' } },
        { status: 400 }
      )
    }

    const repo = new WikiRepository(db)
    const service = new WikiService(repo)
    const id = await service.createCategory({ name, slug, parentId, sortOrder })

    return NextResponse.json({ success: true, data: { id } }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : '创建分类失败' } },
      { status: 500 }
    )
  }
}
