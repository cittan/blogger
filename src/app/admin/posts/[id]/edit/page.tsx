'use client'

import { PostEditor } from '@/components/dashboard/PostEditor'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (data: any) => {
    setIsSaving(true)
    try {
      await fetch('/api/v1/admin/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: params.id, ...data }),
      })
      router.push('/admin/posts')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary mb-6">编辑文章</h1>
      <PostEditor onSave={handleSave} isSaving={isSaving} />
    </div>
  )
}
