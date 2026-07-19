import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '杂谈',
  description: '随便写写',
}

export default function EssaysPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">杂谈</h1>
          <p className="text-sm text-text-secondary">随便写写</p>
        </div>
        <button className="text-xs text-text-secondary hover:text-accent-red transition-colors border border-text-secondary/15 rounded-journal px-3 py-1.5">
          随机一篇
        </button>
      </div>
      <div className="space-y-4" id="essays-list">
        <p className="text-sm text-text-secondary">加载中...</p>
      </div>
    </div>
  )
}
