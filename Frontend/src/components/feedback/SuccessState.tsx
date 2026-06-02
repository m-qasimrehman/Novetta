import type { ReactNode } from 'react'

interface SuccessStateProps {
  title: string
  message: string
  children?: ReactNode
}

export function SuccessState({ title, message, children }: SuccessStateProps) {
  return (
    <div className="glass-surface rounded-[2rem] border border-emerald-400/10 p-8 text-slate-100 shadow-glow">
      <p className="text-sm uppercase tracking-[0.28em] text-emerald-300">{title}</p>
      <h2 className="mt-4 text-2xl font-semibold text-white">{message}</h2>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  )
}
