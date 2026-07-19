import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { PostsRepository } from '@/server/repositories/posts'
import { PostsService } from '@/server/services/posts'

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { env } = getRequestContext()
  const repo = new PostsRepository((env as any).DB)
  const service = new PostsService(repo)

  try {
    const post = await service.getPost(params.slug)
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
