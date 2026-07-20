import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

function getBucket(): R2Bucket | null {
  try {
    const ctx = getRequestContext()
    const env = (ctx as unknown as Record<string, unknown>)?.env as Record<string, unknown> | undefined
    // 优先从 request context 拿
    if (env?.IMAGES) return env.IMAGES as R2Bucket
    // 兜底：Cloudflare Pages 可能把 binding 挂在 process.env 上
    if (typeof process !== 'undefined' && (process.env as Record<string, unknown>)?.IMAGES) {
      return (process.env as Record<string, unknown>).IMAGES as R2Bucket
    }
    return null
  } catch {
    return null
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const bucket = getBucket()
  if (!bucket) {
    return new NextResponse('R2 binding "IMAGES" not found', { status: 500 })
  }

  const { key } = await params
  const objectKey = key.join('/')

  try {
    const object = await bucket.get(objectKey)
    if (!object) {
      return new NextResponse(`Not found: ${objectKey}`, { status: 404 })
    }

    const contentType = object.httpMetadata?.contentType as string | undefined
    const headers = new Headers()
    headers.set('Content-Type', contentType ?? 'image/jpeg')
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')

    return new NextResponse(object.body, { headers })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal error'
    return new NextResponse(msg, { status: 500 })
  }
}
