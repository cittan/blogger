import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { AdminBlogList } from '@/components/dashboard/AdminBlogList'

export default function AdminPostsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-text-primary">文章管理</h1>
        <Link href="/admin/posts/new">
          <Button size="sm">+ 新建文章</Button>
        </Link>
      </div>
      <AdminBlogList />
    </div>
  )
}
