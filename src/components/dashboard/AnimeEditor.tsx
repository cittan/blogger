'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { CoverUpload } from './CoverUpload'

const SEASONS = [
  { value: '春季', label: '春季' },
  { value: '夏季', label: '夏季' },
  { value: '秋季', label: '秋季' },
  { value: '冬季', label: '冬季' },
]

const STATUS_OPTIONS = [
  { value: 'watching', label: '在看' },
  { value: 'completed', label: '看完' },
  { value: 'paused', label: '暂停' },
  { value: 'planned', label: '计划' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i)

interface AnimeEditorProps {
  initialData?: {
    title?: string
    slug?: string
    cover?: string
    season?: string
    year?: number
    status?: string
    progress?: number
    totalEpisodes?: number
    notes?: string
    rating?: number
  }
  onSave: (data: {
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
  }) => void
  isSaving?: boolean
}

export function AnimeEditor({ initialData, onSave, isSaving }: AnimeEditorProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [cover, setCover] = useState(initialData?.cover ?? '')
  const [season, setSeason] = useState(initialData?.season ?? '春季')
  const [year, setYear] = useState(initialData?.year ?? CURRENT_YEAR)
  const [status, setStatus] = useState(initialData?.status ?? 'watching')
  const [progress, setProgress] = useState(initialData?.progress ?? 0)
  const [totalEpisodes, setTotalEpisodes] = useState(initialData?.totalEpisodes ?? 0)
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [rating, setRating] = useState(initialData?.rating ?? 0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title,
      slug,
      cover,
      season,
      year,
      status,
      progress,
      totalEpisodes,
      notes,
      rating,
    })
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!initialData?.slug) {
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9一-鿿]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setSlug(autoSlug)
    }
  }

  const handleRatingClick = (value: number) => {
    setRating(rating === value ? 0 : value)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cover Upload */}
      <CoverUpload value={cover} onChange={setCover} />

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="追番名称"
        className="w-full bg-transparent text-2xl font-bold text-text-primary placeholder:text-text-secondary/30 outline-none"
        required
      />

      {/* Slug */}
      <input
        type="text"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="别名 / Slug（用于 URL）"
        className="w-full bg-transparent text-sm text-text-secondary placeholder:text-text-secondary/30 outline-none"
        required
      />

      {/* Year and Season */}
      <div className="flex gap-4">
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="flex-1 bg-card border border-text-secondary/10 rounded-journal px-3 py-2 text-sm text-text-secondary outline-none"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}年
            </option>
          ))}
        </select>

        <select
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          className="flex-1 bg-card border border-text-secondary/10 rounded-journal px-3 py-2 text-sm text-text-secondary outline-none"
        >
          {SEASONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full bg-card border border-text-secondary/10 rounded-journal px-3 py-2 text-sm text-text-secondary outline-none"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {/* Episodes */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-xs text-text-secondary mb-1">当前集数</label>
          <input
            type="number"
            value={progress}
            onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
            min="0"
            max={totalEpisodes}
            className="w-full bg-card border border-text-secondary/10 rounded-journal px-3 py-2 text-sm text-text-primary outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-text-secondary mb-1">总集数</label>
          <input
            type="number"
            value={totalEpisodes}
            onChange={(e) => setTotalEpisodes(parseInt(e.target.value) || 0)}
            min="0"
            className="w-full bg-card border border-text-secondary/10 rounded-journal px-3 py-2 text-sm text-text-primary outline-none"
          />
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-xs text-text-secondary mb-2">评分（0-10分）</label>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const starValue = (i + 1) * 2
            const filled = rating >= starValue
            const half = !filled && rating >= starValue - 1
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleRatingClick(starValue)}
                className={`text-2xl transition-colors ${
                  filled
                    ? 'text-accent-amber'
                    : half
                      ? 'text-accent-amber/50'
                      : 'text-text-secondary/20 hover:text-accent-amber/30'
                }`}
              >
                ★
              </button>
            )
          })}
          <span className="ml-2 text-sm text-text-secondary">{rating}分</span>
        </div>
      </div>

      {/* Notes */}
      <div className="border-t border-text-secondary/10 pt-4">
        <label className="block text-xs text-text-secondary mb-2">笔记 / 备注</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="记录你的观感或备注..."
          rows={6}
          className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-secondary/30 outline-none resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-text-secondary/10">
        <Button type="button" variant="ghost" size="sm" disabled={isSaving}>
          取消
        </Button>
        <Button type="submit" size="sm" disabled={isSaving}>
          {isSaving ? '保存中...' : '发布'}
        </Button>
      </div>
    </form>
  )
}
