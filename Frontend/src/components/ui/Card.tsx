import type { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={clsx('overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-card', className)}>
      {children}
    </div>
  )
}
