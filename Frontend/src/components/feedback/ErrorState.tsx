import type { ReactNode } from 'react'

interface ErrorStateProps {
  title: string
  message: string
  children?: ReactNode
}

export function ErrorState({ title, message, children }: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-gray-800">
      <p className="text-xs font-bold uppercase tracking-widest text-red-500">{title}</p>
      <h2 className="mt-2 text-xl font-bold text-gray-800">{message}</h2>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  )
}
