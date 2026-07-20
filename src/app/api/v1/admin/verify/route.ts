import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

/**
 * POST /api/v1/admin/verify
 * 验证管理端密钥
 *
 * Cloudflare Pages 环境变量读取顺序：
 * 1. process.env（Pages 构建时注入）
 * 2. getRequestContext().env（运行时 bindings）
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { secret: string }

    // 优先 process.env → ctx.env
    let adminSecret: string | undefined
    try {
      const ctx = getRequestContext()
      const env = (ctx as unknown as { env?: Record<string, unknown> })?.env
      adminSecret = (env?.ADMIN_SECRET as string) || process.env.ADMIN_SECRET
    } catch {
      adminSecret = process.env.ADMIN_SECRET
    }

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
