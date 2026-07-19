'use client'

import { Header } from './Header'
import { Footer } from './Footer'

export function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-14">{children}</main>
      <Footer />
    </>
  )
}
