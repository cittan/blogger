'use client'

import { AdminAnimeList } from '@/components/dashboard/AdminAnimeList'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function AdminAnimePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">追番管理</h1>
        <Link href="/admin/anime/new">
          <Button size="sm">+ 新增追番</Button>
        </Link>
      </div>
      <AdminAnimeList />
    </div>
  )
}
