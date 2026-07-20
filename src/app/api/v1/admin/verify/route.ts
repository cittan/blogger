import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

/**
 * POST /api/v1/admin/verify
 * 验证管理端密钥
 *
 * wrangler.toml [vars] 中声明 ADMIN_SECRET，
 * Cloudflare Dashboard 的实际值在运行时覆盖。
 */
export async function POST(request: NextRequest) {
  const ctx = getRequestContext()
  const env = (ctx as unknown as { env?: Record<string, unknown> })?.env
  const adminSecret = env?.ADMIN_SECRET as string | undefined

  if (!adminSecret) {
    return NextResponse.json(
      { success: false, error: { code: 'CONFIG', message: '管理员密钥未配置' } },
      { status: 500 }
    )
  }

  try {
    const body = (await request.json()) as { secret: string }

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
