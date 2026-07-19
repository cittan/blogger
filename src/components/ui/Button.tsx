'use client'

import { cn } from '@/utils/cn'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-serif tracking-wide transition-all duration-300',
          'rounded-journal select-none',
          variant === 'default' && 'bg-accent-red text-white hover:bg-accent-red/85',
          variant === 'ghost' && 'text-text-secondary hover:text-text-primary',
          variant === 'outline' &&
            'border text-text-secondary hover:text-accent-red hover:border-accent-red',
          variant === 'outline' && 'border-text-secondary/20',
          size === 'sm' && 'px-3 py-1.5 text-xs',
          size === 'md' && 'px-5 py-2 text-sm',
          size === 'lg' && 'px-8 py-3 text-base',
          props.disabled && 'opacity-40 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
