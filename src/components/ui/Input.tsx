import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs text-text-secondary mb-1">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2 text-sm bg-transparent border border-text-secondary/10 rounded-journal text-text-primary',
            'placeholder:text-text-secondary/30 outline-none transition-colors',
            'focus:border-text-secondary/30',
            error && 'border-accent-red',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-accent-red mt-1">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
