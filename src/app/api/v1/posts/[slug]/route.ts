import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/server/db'
import { PostsRepository } from '@/server/repositories/posts'
import { PostsService } from '@/server/services/posts'

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const db = getDB()
  if (!db) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: '文章不存在' } },
      { status: 404 }
    )
  }

  const repo = new PostsRepository(db)
  const service = new PostsService(repo)

  try {
    const post = await service.getPost(slug)
    if (!post) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '文章不存在' } },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: post })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '获取文章失败' } },
      { status: 500 }
    )
  }
}
