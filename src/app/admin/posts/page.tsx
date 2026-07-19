import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function AdminPostsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-text-primary">文章管理</h1>
        <Link href="/admin/posts/new">
          <Button size="sm">+ 新建文章</Button>
        </Link>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-text-secondary">加载中...</p>
      </div>
    </div>
  )
}
