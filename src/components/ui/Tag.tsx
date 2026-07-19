import { cn } from '@/utils/cn'

interface TagProps {
  children: React.ReactNode
  variant?: 'default' | 'red' | 'green' | 'gray'
  className?: string
}

export function Tag({ children, variant = 'default', className }: TagProps) {
  return (
    <span
      className={cn(
        'tag',
        variant === 'red' && 'tag-red',
        variant === 'green' && 'bg-accent-green/15 text-accent-green border-accent-green/25',
        variant === 'gray' && 'bg-text-secondary/10 text-text-secondary border-text-secondary/15',
        className
      )}
    >
      {children}
    </span>
  )
}
