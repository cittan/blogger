'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useCursorEffect } from '@/hooks/useCursorEffect'

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
        {/* Avatar — outer wrapper for cursor parallax, inner for pixelate animation */}
        <div ref={avatarRef} className="w-36 h-36">
          <div
            className="w-full h-full rounded-full overflow-hidden border-2 avatar-enter"
            style={{
              borderColor: 'rgba(240, 235, 227, 0.12)',
              boxShadow:
                '0 0 60px rgba(212, 116, 92, 0.25), 0 0 120px rgba(212, 116, 92, 0.10)',
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-accent-red/35 to-accent-amber/25 flex items-center justify-center text-5xl text-text-primary/60">
              c
            </div>
          </div>
        </div>

        {/* Name — bigger */}
        <h1
          ref={nameRef}
          className="text-6xl font-bold text-text-primary tracking-widest"
        >
          cittan
        </h1>

        {/* Tagline — bigger */}
        <p
          ref={taglineRef}
          className="text-base text-text-secondary tracking-wider"
        >
          只会vibe coding的fw一个
        </p>

        {/* Enter button — bigger */}
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
