'use client'

import { useState } from 'react'
import { cn } from '@/utils/cn'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
}

export function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="card my-6 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-text-secondary/5 bg-text-secondary/[0.02]">
        <span className="text-xs text-text-secondary/60 font-mono">
          {filename ?? language ?? 'code'}
        </span>
        <button
          onClick={handleCopy}
          className={cn(
            'text-xs transition-colors font-mono',
            copied ? 'text-accent-green' : 'text-text-secondary/40 hover:text-text-secondary'
          )}
        >
          {copied ? '✓' : 'Copy'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre className="p-4 m-0 bg-transparent">
          <code className={cn('text-sm font-mono leading-relaxed text-text-primary/90', language && `language-${language}`)}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  )
}
