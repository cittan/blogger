'use client'

import { AnimeEditor } from '@/components/dashboard/AnimeEditor'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewAnimePage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (data: {
    title: string
    slug: string
    cover: string
    season: string
    year: number
    status: string
    progress: number
    totalEpisodes: number
    notes: string
    rating: number
  }) => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/v1/admin/anime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        router.push('/admin/anime')
        router.refresh()
      } else {
        const json = (await res.json()) as { error?: { message: string } }
        alert(json.error?.message || '保存失败')
      }
    } catch (err) {
      console.error('Failed to save anime:', err)
      alert('保存失败')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-text-primary mb-6">新增追番</h1>
      <AnimeEditor onSave={handleSave} isSaving={isSaving} />
    </div>
  )
}
