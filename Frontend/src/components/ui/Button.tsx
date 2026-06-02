import type { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
}

export function Button({ children, variant = 'primary', className, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60'
  const variants = {
    primary:   'bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-400',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:border-brand-400 hover:text-brand-500 focus:ring-brand-200',
    ghost:     'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-200',
    outline:   'border-2 border-brand-500 text-brand-500 bg-white hover:bg-brand-50 focus:ring-brand-200',
  }
  return (
    <button className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </button>
  )
}
