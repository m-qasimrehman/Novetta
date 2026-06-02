import type { InputHTMLAttributes } from 'react'
import clsx from 'clsx'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className={clsx('inline-flex cursor-pointer items-center gap-3 text-sm text-slate-200', className)}>
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-white/20 bg-slate-950 text-emerald-400 focus:ring-emerald-400"
        {...props}
      />
      <span>{label}</span>
    </label>
  )
}
