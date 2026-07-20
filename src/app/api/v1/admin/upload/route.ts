import { NextRequest, NextResponse } from 'next/server'
import { getImagesBucket, generateKey, validateFile, getImageUrl } from '@/server/db/indexR2'

export const runtime = 'edge'

function noR2() {
  return NextResponse.json(
    { success: false, error: { code: 'INTERNAL', message: 'R2 存储服务未配置' } },
    { status: 500 },
  )
}

/**
 * POST /api/v1/admin/upload
 * 上传图片到 R2，支持多文件
 *
 * Request: FormData
 *   - files: File | File[]   要上传的文件
 * Response: { key, url, filename, size }
 */
export async function POST(request: NextRequest) {
  const bucket = getImagesBucket()
  if (!bucket) return noR2()

  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    // 兼容单文件字段名 "file"
    if (files.length === 0) {
      const single = formData.get('file') as File | null
      if (single) files.push(single)
    }

    // 支持目录前缀：category 快捷映射，prefix 直接指定
    const category = (formData.get('category') as string) || ''
    const prefixMap: Record<string, string> = { cover: 'post', content: 'post-content' }
    const prefix = (formData.get('prefix') as string) || prefixMap[category] || 'uploads'

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION', message: '未提供文件' } },
        { status: 400 },
      )
    }

    const results: { key: string; url: string; filename: string; size: number }[] = []
    const errors: string[] = []

    for (const file of files) {
      if (!(file instanceof File)) continue

      const err = validateFile(file)
      if (err) {
        errors.push(`${file.name}: ${err}`)
        continue
      }

      const key = generateKey(file.name, prefix)
      const buffer = await file.arrayBuffer()
      await bucket.put(key, buffer, {
        httpMetadata: {
          contentType: file.type || 'application/octet-stream',
          cacheControl: 'public, max-age=31536000',
        },
      })

      results.push({
        key,
        url: getImageUrl(key),
        filename: file.name,
        size: file.size,
      })
    }

    if (results.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION', message: errors.join('; ') || '无有效文件' },
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          files: results,
          ...(errors.length > 0 && { warnings: errors }),
        },
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '上传失败' } },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/v1/admin/upload?key=uploads/2026/07/xxx.webp
 * 从 R2 删除文件
 */
export async function DELETE(request: NextRequest) {
  const bucket = getImagesBucket()
  if (!bucket) return noR2()

  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION', message: '缺少 key 参数' } },
      { status: 400 },
    )
  }

  try {
    await bucket.delete(key)
    return NextResponse.json({ success: true, data: { key } })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '删除失败' } },
      { status: 500 },
    )
  }
}
