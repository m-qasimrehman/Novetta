import type { InputHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: ReactNode
}

export function Input({ label, error, helperText, icon, className, ...props }: InputProps) {
  return (
    <label className="block text-sm text-gray-700">
      {label && <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">{icon}</div>
        )}
        <input
          className={clsx(
            'w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100',
            icon && 'pl-10',
            error && 'border-red-400 focus:border-red-400 focus:ring-red-100',
            className,
          )}
          {...props}
        />
      </div>
      {helperText && <p className="mt-1 text-xs text-gray-400">{helperText}</p>}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </label>
  )
}
