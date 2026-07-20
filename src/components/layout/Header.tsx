'use client'

import { cn } from '@/utils/cn'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/blog', label: '博客' },
  { href: '/wiki', label: '知识库' },
  { href: '/anime', label: '追番' },
  { href: '/essays', label: '杂谈' },
  { href: '/friends', label: '友链' },
]

export function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [avatarError, setAvatarError] = useState(false)

  const isActive = (href: string) => {
    if (href === '/blog' && pathname.startsWith('/blog')) return true
    return pathname === href
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-text-secondary/5">
      <nav className="max-w-page mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-text-primary hover:text-accent-red transition-colors text-sm tracking-wider"
        >
          {avatarError ? (
            <span className="text-accent-red text-[10px] align-middle">●</span>
          ) : (
            <img
              src="/api/v1/images?key=blogger/avatar/1681626144781ff515610fa5fd34db730dbf3d19b3405bbc4.jpg"
              alt=""
              className="w-5 h-5 rounded-full object-cover"
              onError={() => setAvatarError(true)}
            />
          )}
          cittan
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn('nav-link', isActive(item.href) && 'active')}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/search"
            className="text-text-secondary hover:text-text-primary transition-colors text-sm"
            aria-label="搜索"
          >
            ○
          </Link>
        </div>

        <button
          className="md:hidden text-text-secondary hover:text-text-primary transition-colors text-sm"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="菜单"
        >
          {menuOpen ? '✕' : '≡'}
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden border-t border-text-secondary/5 bg-bg/95 backdrop-blur-md">
          <div className="px-6 py-4 flex flex-col gap-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn('nav-link text-base', isActive(item.href) && 'active')}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/search"
              className="nav-link text-base"
              onClick={() => setMenuOpen(false)}
            >
              搜索
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
