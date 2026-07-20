import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

/** 从 Cloudflare 环境变量中读取 ADMIN_SECRET */
function getAdminSecret(): string | null {
  try {
    const ctx = getRequestContext()
    // Cloudflare Pages: 环境变量在 ctx.env 中，和 bindings 同级
    const env = (ctx as unknown as Record<string, unknown>)?.env as Record<string, unknown> | undefined
    return (env?.ADMIN_SECRET as string) || null
  } catch {
    // fallback: 本地开发时 process.env 也能读到 wrangler.toml [vars]
    return process.env.ADMIN_SECRET || null
  }
}

/**
 * POST /api/v1/admin/verify
 * 验证管理端密钥
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { secret: string }
    const adminSecret = getAdminSecret()

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
