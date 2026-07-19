'use client'

import { cn } from '@/utils/cn'

const CATEGORIES = [
  { key: '', label: '全部' },
  { key: 'tech', label: '技术' },
  { key: 'life', label: '生活' },
  { key: 'anime', label: '动漫' },
]

interface CategoryFilterProps {
  selected: string
  onSelect: (key: string) => void
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onSelect(cat.key)}
          className={cn(
            'px-4 py-1.5 rounded-full text-xs tracking-wide transition-all duration-200 border',
            selected === cat.key
              ? 'border-accent-red/40 text-accent-red bg-accent-red/5'
              : 'border-text-secondary/10 text-text-secondary hover:border-text-secondary/25 hover:text-text-primary'
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
