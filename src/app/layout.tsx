import type { Metadata } from 'next'
import { LayoutShell } from '@/components/layout/LayoutShell'
import { Providers } from './providers'
import './global.css'

export const metadata: Metadata = {
  title: {
    default: 'cittan',
    template: '%s — cittan',
  },
  description: '只会vibe coding的fw一个',
  metadataBase: new URL('https://cittan.blog'),
  openGraph: {
    title: 'cittan',
    description: '只会vibe coding的fw一个',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  )
}
