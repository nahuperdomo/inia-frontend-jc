import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-10 sm:h-9 w-full min-w-0 rounded-lg sm:rounded-md border bg-transparent px-4 sm:px-3 py-2 sm:py-1 text-base shadow-xs transition-all duration-300 ease-in-out outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm touch-manipulation',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:shadow-md',
        'hover:border-ring/50 hover:shadow-sm',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive aria-invalid:animate-shake',
        // Prevenir zoom en iOS mobile
        '[font-size:16px] sm:[font-size:inherit]',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
