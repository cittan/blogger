import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/server/db'
import { AnimeRepository } from '@/server/repositories/anime'
import { AnimeService } from '@/server/services/anime'
import { animeSchema } from '@/schemas/anime'

export const runtime = 'edge'

function noDB() {
  return NextResponse.json(
    { success: false, error: { code: 'INTERNAL', message: '数据库未连接' } },
    { status: 500 }
  )
}

/** GET — 管理端获取全部追番记录 */
export async function GET(request: NextRequest) {
  const db = getDB()
  if (!db) return noDB()

  const repo = new AnimeRepository(db)
  const service = new AnimeService(repo)

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? undefined

  try {
    const items = await service.listAnime(status)
    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '获取追番列表失败' } },
      { status: 500 }
    )
  }
}

/** POST — 创建追番记录 */
export async function POST(request: NextRequest) {
  const db = getDB()
  if (!db) return noDB()

  const repo = new AnimeRepository(db)
  const service = new AnimeService(repo)

  try {
    const body = (await request.json()) as Record<string, unknown>
    const parsed = animeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION', message: parsed.error.errors[0]?.message ?? '数据校验失败' } },
        { status: 400 }
      )
    }
    const id = await service.createAnime(parsed.data)
    return NextResponse.json({ success: true, data: { id } }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '创建追番记录失败' } },
      { status: 500 }
    )
  }
}

/** PUT — 更新追番记录 */
export async function PUT(request: NextRequest) {
  const db = getDB()
  if (!db) return noDB()

  const repo = new AnimeRepository(db)
  const service = new AnimeService(repo)

  try {
    const body = (await request.json()) as Record<string, unknown>
    const slug = body.slug as string | undefined
    const { slug: _s, ...data } = body
    if (!slug) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION', message: '缺少 slug' } },
        { status: 400 }
      )
    }
    const parsed = animeSchema.partial().safeParse(data)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION', message: parsed.error.errors[0]?.message ?? '数据校验失败' } },
        { status: 400 }
      )
    }
    await service.updateAnime(slug, parsed.data)
    return NextResponse.json({ success: true, data: { slug } })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '更新追番记录失败' } },
      { status: 500 }
    )
  }
}

/** DELETE — 删除追番记录 */
export async function DELETE(request: NextRequest) {
  const db = getDB()
  if (!db) return noDB()

  const repo = new AnimeRepository(db)
  const service = new AnimeService(repo)

  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  if (!slug) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION', message: '缺少 slug' } },
      { status: 400 }
    )
  }

  try {
    await service.deleteAnime(slug)
    return NextResponse.json({ success: true, data: null })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '删除追番记录失败' } },
      { status: 500 }
    )
  }
}
