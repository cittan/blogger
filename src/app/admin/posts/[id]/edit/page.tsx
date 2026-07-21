'use client'

import { PostEditor } from '@/components/dashboard/PostEditor'
import { useRouter } from 'next/navigation'
import { useState, use, useEffect } from 'react'

export const runtime = 'edge'

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [initialData, setInitialData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/v1/admin/posts/${id}`)
        const json = (await res.json()) as {
          success: boolean
          data?: {
            title?: string
            slug?: string
            content?: string
            summary?: string
            category?: string
            cover?: string
          }
        }
        if (json.success && json.data) {
          setInitialData(json.data)
        }
      } catch (error) {
        console.error('Failed to fetch post:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [id])

  const handleSave = async (data: any) => {
    setIsSaving(true)
    try {
      await fetch('/api/v1/admin/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldSlug: id, ...data }),
      })
      router.push('/admin/posts')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-secondary">加载中...</div>
      </div>
    )
  }

  if (!initialData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-secondary">文章不存在</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary mb-6">编辑文章</h1>
      <PostEditor initialData={initialData} onSave={handleSave} isSaving={isSaving} />
    </div>
  )
}
