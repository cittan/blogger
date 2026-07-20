import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

/**
 * POST /api/v1/admin/verify
 * 验证管理端密钥
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { secret: string }
    const adminSecret = process.env.ADMIN_SECRET

    if (!adminSecret) {
      return NextResponse.json(
        { success: false, error: { code: 'CONFIG', message: '管理员密钥未配置' } },
        { status: 500 }
      )
    }

    if (body.secret === adminSecret) {
      return NextResponse.json({ success: true, data: null })
    }

    return NextResponse.json(
      { success: false, error: { code: 'AUTH', message: '密钥错误' } },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '验证失败' } },
      { status: 500 }
    )
  }
}
