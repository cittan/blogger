import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '追番',
  description: '看过的那些动画',
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  watching: { label: '在追', color: '#d4745c' },
  completed: { label: '追完', color: '#8aaa7a' },
  paused: { label: '搁置', color: '#8b8680' },
  planned: { label: '想看', color: '#7a9a8a' },
}

export default function AnimePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-2">追番</h1>
      <p className="text-sm text-text-secondary mb-10">看过的那些动画</p>
      <div className="space-y-12">
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-text-primary">2026 · 夏</h2>
          <div className="grid gap-3 sm:grid-cols-2" id="anime-grid">
            <p className="text-sm text-text-secondary col-span-2">加载中...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
