import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { PostsRepository } from '@/server/repositories/posts'
import { PostsService } from '@/server/services/posts'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { env } = getRequestContext()
  const repo = new PostsRepository((env as any).DB)
  const service = new PostsService(repo)

  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor') ?? undefined
  const limit = parseInt(searchParams.get('limit') ?? '10', 10)
  const category = searchParams.get('category') ?? undefined
  const tag = searchParams.get('tag') ?? undefined
  const keyword = searchParams.get('keyword') ?? undefined

  try {
    const result = await service.listPosts({ cursor, limit, category, tag, keyword })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '获取文章列表失败' } },
      { status: 500 }
    )
  }
}
