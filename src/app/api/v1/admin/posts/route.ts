import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/server/db'
import { PostsRepository } from '@/server/repositories/posts'
import { PostsService } from '@/server/services/posts'
import { postSchema, updatePostSchema } from '@/schemas/posts'

export const runtime = 'edge'

function noDB() {
  return NextResponse.json(
    { success: false, error: { code: 'INTERNAL', message: '数据库未连接' } },
    { status: 500 }
  )
}

/** GET — 管理端获取全部文章（含未发布） */
export async function GET(request: NextRequest) {
  const db = getDB()
  if (!db) return noDB()

  const repo = new PostsRepository(db)
  const service = new PostsService(repo)

  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor') ?? undefined
  const limit = parseInt(searchParams.get('limit') ?? '50', 10)
  const category = searchParams.get('category') ?? undefined
  const keyword = searchParams.get('keyword') ?? undefined

  try {
    const result = await service.listAllPosts({ cursor, limit, category, keyword })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '获取文章列表失败' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const db = getDB()
  if (!db) return noDB()

  const repo = new PostsRepository(db)
  const service = new PostsService(repo)

  try {
    const body = (await request.json()) as Record<string, unknown>
    const parsed = postSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION', message: parsed.error.errors[0]?.message ?? '数据校验失败' } },
        { status: 400 }
      )
    }
    const result = await service.createPost(parsed.data)
    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '创建文章失败' } },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const db = getDB()
  if (!db) return noDB()

  const repo = new PostsRepository(db)
  const service = new PostsService(repo)

  try {
    const body = (await request.json()) as Record<string, unknown>
    const oldSlug = body.oldSlug as string | undefined
    const { oldSlug: _os, ...data } = body
    if (!oldSlug) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION', message: '缺少 oldSlug' } },
        { status: 400 }
      )
    }
    const parsed = updatePostSchema.safeParse(data)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION', message: parsed.error.errors[0]?.message ?? '数据校验失败' } },
        { status: 400 }
      )
    }
    await service.updatePost(oldSlug, parsed.data)
    return NextResponse.json({ success: true, data: { slug: parsed.data.slug ?? oldSlug } })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '更新文章失败' } },
      { status: 500 }
    )
  }
}

/** PATCH — 切换置顶状态 */
export async function PATCH(request: NextRequest) {
  const db = getDB()
  if (!db) return noDB()

  const repo = new PostsRepository(db)
  const service = new PostsService(repo)

  try {
    const body = (await request.json()) as { slug: string }
    if (!body.slug) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION', message: '缺少 slug' } },
        { status: 400 }
      )
    }
    const isPinned = await service.togglePin(body.slug)
    return NextResponse.json({ success: true, data: { isPinned } })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '操作失败' } },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const db = getDB()
  if (!db) return noDB()

  const repo = new PostsRepository(db)
  const service = new PostsService(repo)

  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  if (!slug) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION', message: '缺少 slug' } },
      { status: 400 }
    )
  }

  try {
    await service.deletePost(slug)
    return NextResponse.json({ success: true, data: null })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '删除文章失败' } },
      { status: 500 }
    )
  }
}
