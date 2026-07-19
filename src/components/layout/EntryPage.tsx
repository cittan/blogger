'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useCursorEffect } from '@/hooks/useCursorEffect'

// Staggered delays for 4×4 tile wave reveal (top-left → bottom-right)
const TILE_DELAYS = [
  0.00, 0.05, 0.10, 0.15,
  0.06, 0.11, 0.16, 0.21,
  0.12, 0.17, 0.22, 0.27,
  0.18, 0.23, 0.28, 0.33,
]

export function EntryPage() {
  const avatarRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)

  useCursorEffect([
    { ref: avatarRef, factor: 14 },
    { ref: nameRef, factor: 7 },
    { ref: taglineRef, factor: 4 },
  ])

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      {/* Central warm glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(230, 180, 80, 0.10) 0%, rgba(212, 116, 92, 0.04) 40%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Avatar — outer wrapper for cursor parallax */}
        <div ref={avatarRef} className="w-36 h-36">
          {/* Inner wrapper — circle clip + border + glow */}
          <div
            className="relative w-full h-full rounded-full overflow-hidden border-2"
            style={{
              borderColor: 'rgba(240, 235, 227, 0.12)',
              boxShadow:
                '0 0 60px rgba(212, 116, 92, 0.25), 0 0 120px rgba(212, 116, 92, 0.10)',
            }}
          >
            {/* Avatar content — starts grayscale, fades to color */}
            <div className="w-full h-full avatar-color-reveal bg-gradient-to-br from-accent-red/35 to-accent-amber/25 flex items-center justify-center text-5xl text-text-primary/60">
              c
            </div>

            {/* 4×4 tile overlay — fades away to reveal avatar */}
            <div className="avatar-tile-grid">
              {TILE_DELAYS.map((delay, i) => (
                <div
                  key={i}
                  className="avatar-tile"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Name */}
        <h1
          ref={nameRef}
          className="text-6xl font-bold text-text-primary tracking-widest"
        >
          cittan
        </h1>

        {/* Tagline */}
        <p
          ref={taglineRef}
          className="text-base text-text-secondary tracking-wider"
        >
          只会vibe coding的fw一个
        </p>

        {/* Enter button */}
        <Link
          href="/blog"
          className="mt-10 px-10 py-3 border text-text-secondary hover:text-accent-red hover:border-accent-red transition-all duration-300 rounded-journal tracking-widest text-base hover:scale-[1.03]"
          style={{ borderColor: 'rgba(240, 235, 227, 0.15)' }}
        >
          进入博客 →
        </Link>
      </div>
    </div>
  )
}
