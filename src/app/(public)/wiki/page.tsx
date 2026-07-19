import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '知识库',
}

export default function WikiPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-2">知识库</h1>
      <p className="text-sm text-text-secondary mb-10">笔记与知识整理</p>
      <div className="grid gap-4 sm:grid-cols-2" id="wiki-grid">
        <p className="text-sm text-text-secondary col-span-2">加载中...</p>
      </div>
    </div>
  )
}
