import { NextRequest, NextResponse } from 'next/server'
import { getImagesBucket } from '@/server/db/indexR2'

export const runtime = 'edge'

/**
 * GET /api/v1/images/blogger/avatar/cittan.jpg
 * 通过 R2 binding 直接读取文件并返回，无需配置公开域名
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const bucket = getImagesBucket()
  if (!bucket) {
    return new NextResponse('Storage not available', { status: 500 })
  }

  const { key } = await params
  const objectKey = key.join('/')

  try {
    const object = await bucket.get(objectKey)
    if (!object) {
      return new NextResponse('Not found', { status: 404 })
    }

    const headers = new Headers()
    headers.set('Content-Type', object.httpMetadata?.contentType ?? 'image/jpeg')
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')

    return new NextResponse(object.body, { headers })
  } catch {
    return new NextResponse('Internal error', { status: 500 })
  }
}
