import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

interface CloudflareEnv {
  ADMIN_SECRET?: string
  DB?: D1Database
  IMAGES?: R2Bucket
}

interface VerifyRequest {
  secret?: string
}

export async function POST(request: NextRequest) {
  try {
    const { env } = getRequestContext() as {
      env: CloudflareEnv
    }

    const adminSecret = env.ADMIN_SECRET

    if (!adminSecret) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFIG',
            message: '管理员密钥未配置'
          }
        },
        {
          status: 500
        }
      )
    }

    const body = (await request.json()) as VerifyRequest

    if (!body.secret) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PARAM',
            message: '请输入管理员密钥'
          }
        },
        {
          status: 400
        }
      )
    }

    if (body.secret !== adminSecret) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH',
            message: '密钥错误'
          }
        },
        {
          status: 401
        }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        verified: true
      }
    })

  } catch (error) {
    console.error('verify admin error:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL',
          message: '验证失败'
        }
      },
      {
        status: 500
      }
    )
  }
}