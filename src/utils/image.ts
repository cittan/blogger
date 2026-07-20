/**
 * 构造 R2 图片访问 URL
 * - 空字符串 → null
 * - http(s) → 直接使用（兼容外部 URL）
 * - /api/v1/images?key=xxx → 直接使用（已是正确格式）
 * - /api/v1/images/xxx → 转为 ?key=xxx（旧 catch-all 格式兼容）
 * - 纯 key → 拼接 /api/v1/images?key=xxx
 */
export function getCoverSrc(cover: string): string | null {
  if (!cover) return null
  if (cover.startsWith('http')) return cover
  // 已经是 ?key= 格式
  if (cover.startsWith('/api/') && cover.includes('?key=')) return cover
  // 旧 catch-all 格式 /api/v1/images/xxx → 转 ?key=xxx
  if (cover.startsWith('/api/v1/images/')) {
    const key = cover.slice('/api/v1/images/'.length)
    return `/api/v1/images?key=${encodeURIComponent(key)}`
  }
  // 纯 R2 key
  return `/api/v1/images?key=${encodeURIComponent(cover)}`
}
