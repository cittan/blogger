import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/server/db'
import { WikiRepository } from '@/server/repositories/wiki'
import { WikiService } from '@/server/services/wiki'

export const runtime = 'edge'

// GET /api/v1/admin/wiki/categories/[id] - 获取单个分类
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
    const category = await service.getCategoryById(parseInt(id))

    if (!category) {
      return NextResponse.json(
        { success: false, error: { message: '分类不存在' } },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : '获取分类失败' } },
      { status: 500 }
    )
  }
}

// PUT /api/v1/admin/wiki/categories/[id] - 更新分类
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
    const body = (await request.json()) as { name?: string; slug?: string; parentId?: number | null; sortOrder?: number }
    const { name, slug, parentId, sortOrder } = body

    const repo = new WikiRepository(db)
    const service = new WikiService(repo)
    await service.updateCategory(parseInt(id), { name, slug, parentId, sortOrder })

    return NextResponse.json({ success: true, data: { message: '更新成功' } })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : '更新分类失败' } },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/admin/wiki/categories/[id] - 删除分类
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
    await service.deleteCategory(parseInt(id))

    return NextResponse.json({ success: true, data: { message: '删除成功' } })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : '删除分类失败' } },
      { status: 500 }
    )
  }
}
