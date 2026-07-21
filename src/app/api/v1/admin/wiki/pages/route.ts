import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/server/db'
import { WikiRepository } from '@/server/repositories/wiki'
import { WikiService } from '@/server/services/wiki'

export const runtime = 'edge'

// GET /api/v1/admin/wiki/pages - 获取页面列表
export async function GET(request: NextRequest) {
  const db = getDB()
  if (!db) {
    return NextResponse.json({ success: false, error: { message: '数据库未连接' } }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const isPublished = searchParams.get('isPublished')
    const keyword = searchParams.get('keyword')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    const repo = new WikiRepository(db)
    const service = new WikiService(repo)
    const result = await service.getPages({
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      isPublished: isPublished !== null ? isPublished === 'true' : undefined,
      keyword: keyword || undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : '获取页面列表失败' } },
      { status: 500 }
    )
  }
}

// POST /api/v1/admin/wiki/pages - 创建页面
export async function POST(request: NextRequest) {
  const db = getDB()
  if (!db) {
    return NextResponse.json({ success: false, error: { message: '数据库未连接' } }, { status: 500 })
  }

  try {
    const body = (await request.json()) as {
      title?: string
      slug?: string
      cover?: string
      categoryId?: number | null
      content?: string
      isPublished?: boolean
    }
    const { title, slug, cover, categoryId, content, isPublished } = body

    if (!title || !slug || !content) {
      return NextResponse.json(
        { success: false, error: { message: '标题、标识和内容不能为空' } },
        { status: 400 }
      )
    }

    const repo = new WikiRepository(db)
    const service = new WikiService(repo)
    const id = await service.createPage({
      title,
      slug,
      cover,
      categoryId,
      content,
      isPublished,
    })

    return NextResponse.json({ success: true, data: { id } }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : '创建页面失败' } },
      { status: 500 }
    )
  }
}
