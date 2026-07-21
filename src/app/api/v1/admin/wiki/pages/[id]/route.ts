import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/server/db'
import { WikiRepository } from '@/server/repositories/wiki'
import { WikiService } from '@/server/services/wiki'

export const runtime = 'edge'

// GET /api/v1/admin/wiki/pages/[id] - 获取单个页面
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const db = getDB()
  if (!db) {
    return NextResponse.json({ success: false, error: { message: '数据库未连接' } }, { status: 500 })
  }

  try {
    const repo = new WikiRepository(db)
    const service = new WikiService(repo)
    const page = await service.getPageById(parseInt(id))

    if (!page) {
      return NextResponse.json(
        { success: false, error: { message: '页面不存在' } },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: page })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : '获取页面失败' } },
      { status: 500 }
    )
  }
}

// PUT /api/v1/admin/wiki/pages/[id] - 更新页面
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    const repo = new WikiRepository(db)
    const service = new WikiService(repo)
    await service.updatePage(parseInt(id), {
      title,
      slug,
      cover,
      categoryId,
      content,
      isPublished,
    })

    return NextResponse.json({ success: true, data: { message: '更新成功' } })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : '更新页面失败' } },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/admin/wiki/pages/[id] - 删除页面
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const db = getDB()
  if (!db) {
    return NextResponse.json({ success: false, error: { message: '数据库未连接' } }, { status: 500 })
  }

  try {
    const repo = new WikiRepository(db)
    const service = new WikiService(repo)
    await service.deletePage(parseInt(id))

    return NextResponse.json({ success: true, data: { message: '删除成功' } })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : '删除页面失败' } },
      { status: 500 }
    )
  }
}
