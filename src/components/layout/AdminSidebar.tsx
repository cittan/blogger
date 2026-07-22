'use client'

import { cn } from '@/utils/cn'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ADMIN_NAV = [
  { href: '/admin', label: '仪表盘', icon: '◫' },
  { href: '/admin/posts', label: '文章管理', icon: '☷' },
  { href: '/admin/anime', label: '追番管理', icon: '▶' },
  { href: '/admin/media', label: '媒体库', icon: '▣' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-[calc(100vh-3.5rem)] border-r border-text-secondary/5 bg-card/50 p-4">
      <nav className="flex flex-col gap-1">
        {ADMIN_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-journal text-sm transition-all duration-200',
              pathname === item.href
                ? 'bg-accent-red/10 text-accent-red'
                : 'text-text-secondary hover:text-text-primary hover:bg-text-secondary/5'
            )}
          >
            <span className="text-xs w-5 text-center">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
