import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/server/db'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  const db = getDB()
  if (!db) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '服务未配置' } },
      { status: 500 }
    )
  }

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
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/images/v1`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}` },
        body: formData,
      }
    )

    const result = (await response.json()) as { success: boolean; result?: { variants: string[] } }
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'UPLOAD_FAILED', message: '上传失败' } },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: { url: result.result!.variants[0] } })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '上传失败' } },
      { status: 500 }
    )
  }
}
