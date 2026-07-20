'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useCursorEffect } from '@/hooks/useCursorEffect'

// 4×4 tile fragment configs — each tile flies in from one of 4 directions.
// sx/sy: start offset in px; bgx/bgy: background-position to show gradient slice.
const TILES = [
  // row 0 — top edge
  { sx: '-60px', sy: '-130px', bgx: '0px',    bgy: '0px',    delay: '0.00s' },
  { sx: '-20px', sy: '-150px', bgx: '-36px',  bgy: '0px',    delay: '0.03s' },
  { sx:  '20px', sy: '-150px', bgx: '-72px',  bgy: '0px',    delay: '0.06s' },
  { sx:  '60px', sy: '-130px', bgx: '-108px', bgy: '0px',    delay: '0.02s' },
  // row 1 — left / top-left / top-right / right
  { sx: '-140px', sy: '-50px',  bgx: '0px',    bgy: '-36px', delay: '0.04s' },
  { sx: '-110px', sy: '-110px', bgx: '-36px',  bgy: '-36px', delay: '0.09s' },
  { sx:  '110px', sy: '-110px', bgx: '-72px',  bgy: '-36px', delay: '0.12s' },
  { sx:  '140px', sy: '-50px',  bgx: '-108px', bgy: '-36px', delay: '0.05s' },
  // row 2 — left / bottom-left / bottom-right / right
  { sx: '-140px', sy:  '50px',  bgx: '0px',    bgy: '-72px', delay: '0.08s' },
  { sx: '-110px', sy:  '110px',  bgx: '-36px',  bgy: '-72px', delay: '0.13s' },
  { sx:  '110px', sy:  '110px',  bgx: '-72px',  bgy: '-72px', delay: '0.10s' },
  { sx:  '140px', sy:  '50px',  bgx: '-108px', bgy: '-72px', delay: '0.07s' },
  // row 3 — bottom edge
  { sx: '-60px', sy:  '130px', bgx: '0px',    bgy: '-108px', delay: '0.01s' },
  { sx: '-20px', sy:  '150px', bgx: '-36px',  bgy: '-108px', delay: '0.04s' },
  { sx:  '20px', sy:  '150px', bgx: '-72px',  bgy: '-108px', delay: '0.03s' },
  { sx:  '60px', sy:  '130px', bgx: '-108px', bgy: '-108px', delay: '0.06s' },
]

export function EntryPage() {
  const avatarRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const [imgError, setImgError] = useState(false)

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
          {/* Inner wrapper — circle clip + border + glow + grayscale→color */}
          <div
            className="relative w-full h-full rounded-full overflow-hidden border-2 avatar-color-reveal"
            style={{
              borderColor: 'rgba(240, 235, 227, 0.12)',
              boxShadow:
                '0 0 60px rgba(212, 116, 92, 0.25), 0 0 120px rgba(212, 116, 92, 0.10)',
            }}
          >
            {/* Avatar — R2 图片，加载失败降级为占位符 */}
            {imgError ? (
              <div className="w-full h-full bg-gradient-to-br from-accent-red/35 to-accent-amber/25 flex items-center justify-center">
                <span className="text-5xl text-text-primary/60 avatar-letter-reveal">c</span>
              </div>
            ) : (
              <img
                src="/api/v1/images?key=blogger/avatar/1681626144781ff515610fa5fd34db730dbf3d19b3405bbc4.jpg"
                alt="cittan"
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            )}

            {/* 4×4 tile overlay — fragments fly in from 4 directions */}
            <div className="avatar-tile-grid">
              {TILES.map((t, i) => (
                <div
                  key={i}
                  className="avatar-tile"
                  style={{
                    '--sx': t.sx,
                    '--sy': t.sy,
                    animationDelay: t.delay,
                  } as React.CSSProperties}
                >
                  <div
                    className="avatar-tile-inner"
                    style={{ backgroundPosition: `${t.bgx} ${t.bgy}` }}
                  />
                </div>
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
