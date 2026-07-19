export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

export function formatDateWithDot(dateStr: string | null | undefined): string {
  const formatted = formatDate(dateStr)
  return formatted ? `● ${formatted}` : ''
}

export function getYear(dateStr: string): number {
  return new Date(dateStr).getFullYear()
}

export function getSeason(dateStr: string): string {
  const m = new Date(dateStr).getMonth() + 1
  if (m <= 3) return '冬'
  if (m <= 6) return '春'
  if (m <= 9) return '夏'
  return '秋'
}
