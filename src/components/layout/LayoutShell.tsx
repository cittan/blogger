'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Footer } from './Footer'

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isEntry = pathname === '/'

  if (isEntry) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-14">{children}</main>
      <Footer />
    </>
  )
}
