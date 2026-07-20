import { getRequestContext } from '@cloudflare/next-on-pages'

/** 允许的图片 MIME 类型 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
] as const

/** 最大文件大小 10MB */
export const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * 获取 R2 存储桶绑定（IMAGES）
 * 对应 wrangler.toml 中的 [[r2_buckets]] binding
 */
export function getImagesBucket(): R2Bucket | null {
  try {
    const ctx = getRequestContext()
    return ((ctx as unknown as Record<string, unknown>)?.env as Record<string, unknown>)
      ?.IMAGES as R2Bucket | null
  } catch {
    return null
  }
}

/**
 * 生成 R2 对象 key：{prefix}/YYYY/MM/timestamp-filename
 * @param filename 原始文件名
 * @param prefix 目录前缀，默认 'uploads'；封面用 'post'，正文图片用 'post-content'
 */
export function generateKey(filename: string, prefix = 'uploads'): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const ts = Date.now()

  // 清理文件名：保留中文、字母、数字、-、_、.
  const safeName = filename.replace(/[^a-zA-Z0-9一-鿿\-_.]/g, '_')
  return `${prefix}/${year}/${month}/${ts}-${safeName}`
}

/**
 * 校验上传文件
 * @returns error message 字符串，若通过校验则返回 null
 */
export function validateFile(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase()
  const forbiddenExts = ['exe', 'sh', 'bat', 'cmd', 'php', 'jsp', 'asp', 'aspx']

  if (ext && forbiddenExts.includes(ext)) {
    return '不支持的文件类型'
  }

  if (file.size > MAX_FILE_SIZE) {
    return '文件大小不能超过 10MB'
  }

  if (file.size === 0) {
    return '文件为空'
  }

  return null
}

/**
 * 上传文件到 R2
 */
export async function uploadToR2(
  key: string,
  body: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob,
  contentType?: string,
): Promise<{ success: boolean; message: string }> {
  const bucket = getImagesBucket()
  if (!bucket) return { success: false, message: 'R2 bucket not available' }

  try {
    const options: R2PutOptions = {
      httpMetadata: {
        contentType: contentType ?? 'application/octet-stream',
        cacheControl: 'public, max-age=31536000',
      },
    }
    await bucket.put(key, body, options)
    return { success: true, message: 'Uploaded' }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Upload failed' }
  }
}

/**
 * 从 R2 删除文件
 */
export async function deleteFromR2(key: string): Promise<{ success: boolean; message: string }> {
  const bucket = getImagesBucket()
  if (!bucket) return { success: false, message: 'R2 bucket not available' }

  try {
    await bucket.delete(key)
    return { success: true, message: 'Deleted' }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Delete failed' }
  }
}

/**
 * 获取文件的公开访问 URL
 */
export function getImageUrl(key: string): string {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? ''
  if (base) return `${base}/${key}`
  return `/api/v1/images?key=${encodeURIComponent(key)}`
}
