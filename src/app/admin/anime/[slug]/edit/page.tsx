'use client'

import { AnimeEditor } from '@/components/dashboard/AnimeEditor'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export const runtime = 'edge'

export default function EditAnimePage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const [slug, setSlug] = useState<string>('')
  const [initialData, setInitialData] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    params.then((p) => setSlug(p.slug))
  }, [params])

  useEffect(() => {
    if (!slug) return

    const fetchAnime = async () => {
      try {
        const res = await fetch(`/api/v1/admin/anime/${slug}`)
        if (!res.ok) {
          throw new Error('获取追番信息失败')
        }
        const json = (await res.json()) as {
          success: boolean
          data?: any
          error?: { message: string }
        }
        if (json.success && json.data) {
          setInitialData(json.data)
        } else {
          throw new Error(json.error?.message || '数据格式错误')
        }
      } catch (err) {
        console.error('Failed to fetch anime:', err)
        setError(err instanceof Error ? err.message : '加载失败')
      } finally {
        setLoading(false)
      }
    }

    fetchAnime()
  }, [slug])

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
    if (!slug) return

    setIsSaving(true)
    try {
      const res = await fetch(`/api/v1/admin/anime/${slug}`, {
        method: 'PUT',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-secondary">加载中...</div>
      </div>
    )
  }

  if (error || !initialData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-accent-red">{error || '追番信息不存在'}</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-text-primary mb-6">编辑追番</h1>
      <AnimeEditor initialData={initialData} onSave={handleSave} isSaving={isSaving} />
    </div>
  )
}
