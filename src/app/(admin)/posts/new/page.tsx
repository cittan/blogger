'use client'

import { PostEditor } from '@/components/dashboard/PostEditor'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewPostPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (data: any) => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/v1/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        router.push('/admin/posts')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary mb-6">新建文章</h1>
      <PostEditor onSave={handleSave} isSaving={isSaving} />
    </div>
  )
}
