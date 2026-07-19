import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { PostsRepository } from '@/server/repositories/posts'
import { PostsService } from '@/server/services/posts'
import { postSchema, updatePostSchema } from '@/schemas/posts'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  const { env } = getRequestContext()
  const repo = new PostsRepository((env as any).DB)
  const service = new PostsService(repo)

  try {
    const body = await request.json()
    const parsed = postSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION',
            message: parsed.error.errors[0]?.message ?? '数据校验失败',
          },
        },
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
  const { env } = getRequestContext()
  const repo = new PostsRepository((env as any).DB)
  const service = new PostsService(repo)

  try {
    const body = await request.json()
    const { slug, ...data } = body
    if (!slug) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION', message: '缺少 slug' } },
        { status: 400 }
      )
    }

    const parsed = updatePostSchema.safeParse(data)
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION',
            message: parsed.error.errors[0]?.message ?? '数据校验失败',
          },
        },
        { status: 400 }
      )
    }

    await service.updatePost(slug, parsed.data)
    return NextResponse.json({ success: true, data: { slug } })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '更新文章失败' } },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const { env } = getRequestContext()
  const repo = new PostsRepository((env as any).DB)
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
