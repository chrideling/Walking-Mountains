import { clsx } from 'clsx'
import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
}

export function Card({ children, hover, className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white border border-stone-200 rounded-2xl',
        hover && 'transition-shadow hover:shadow-sm cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
