import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 ease-in-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-95 touch-manipulation select-none",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:text-primary-foreground hover:shadow-md active:shadow-sm',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 hover:text-white hover:shadow-md active:shadow-sm focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground hover:shadow-md hover:border-accent-foreground/20 active:shadow-sm dark:bg-input/30 dark:border-input dark:hover:bg-input/50 dark:hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 hover:text-secondary-foreground hover:shadow-md active:shadow-sm',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 dark:hover:text-accent-foreground active:bg-accent/70',
        link: 'text-primary underline-offset-4 hover:underline hover:text-primary active:opacity-70',
      },
      size: {
        default: 'h-10 sm:h-9 px-4 py-2 text-base sm:text-sm has-[>svg]:px-3 min-h-[44px] sm:min-h-0',
        sm: 'h-9 sm:h-8 rounded-md gap-1.5 px-3 text-sm has-[>svg]:px-2.5 min-h-[44px] sm:min-h-0',
        lg: 'h-12 sm:h-11 lg:h-10 rounded-lg px-6 text-base sm:text-base has-[>svg]:px-4 min-h-[44px] sm:min-h-0',
        icon: 'size-11 sm:size-10 lg:size-9 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...(props as any)}
    />
  )
}

export { Button, buttonVariants }
