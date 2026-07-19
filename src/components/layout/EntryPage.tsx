'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useCursorEffect } from '@/hooks/useCursorEffect'

export function EntryPage() {
  const avatarRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)

  useCursorEffect([
    { ref: avatarRef, factor: 10 },
    { ref: nameRef, factor: 5 },
    { ref: taglineRef, factor: 3 },
  ])

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      {/* Central warm glow on entry page */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(230, 180, 80, 0.08) 0%, rgba(212, 116, 92, 0.03) 40%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Avatar with glow */}
        <div
          ref={avatarRef}
          className="relative w-24 h-24 rounded-full overflow-hidden border-2"
          style={{
            borderColor: 'rgba(240, 235, 227, 0.1)',
            boxShadow:
              '0 0 40px rgba(212, 116, 92, 0.2), 0 0 80px rgba(212, 116, 92, 0.08)',
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-accent-red/30 to-accent-amber/20 flex items-center justify-center text-3xl text-text-primary/60">
            c
          </div>
        </div>

        {/* Name */}
        <h1
          ref={nameRef}
          className="text-4xl font-bold text-text-primary tracking-wider"
        >
          cittan
        </h1>

        {/* Tagline */}
        <p ref={taglineRef} className="text-sm text-text-secondary tracking-wide">
          只会vibe coding的fw一个
        </p>

        {/* Enter button */}
        <Link
          href="/blog"
          className="mt-8 px-8 py-2.5 border text-text-secondary hover:text-accent-red hover:border-accent-red transition-all duration-300 rounded-journal tracking-wider text-sm hover:scale-[1.03]"
          style={{ borderColor: 'rgba(240, 235, 227, 0.15)' }}
        >
          进入博客 →
        </Link>
      </div>
    </div>
  )
}
