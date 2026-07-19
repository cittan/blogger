import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '友链',
}

export default function FriendsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-2">友链</h1>
      <p className="text-sm text-text-secondary mb-10">朋友们的地方</p>
      <div className="grid gap-3 sm:grid-cols-2" id="friends-grid">
        <p className="text-sm text-text-secondary col-span-2">加载中...</p>
      </div>
    </div>
  )
}
