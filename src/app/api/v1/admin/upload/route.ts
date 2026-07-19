import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  const { env } = getRequestContext()

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION', message: '未提供文件' } },
        { status: 400 }
      )
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${(env as any).CF_ACCOUNT_ID}/images/v1`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${(env as any).CF_API_TOKEN}`,
        },
        body: formData,
      }
    )

    const result = (await response.json()) as any
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'UPLOAD_FAILED', message: '上传失败' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { url: result.result.variants[0] },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '上传失败' } },
      { status: 500 }
    )
  }
}
