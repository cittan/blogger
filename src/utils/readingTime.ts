export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const text = content.replace(/[#*`~\[\]()>|\\]/g, '')
  const wordCount = text.length
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}
