import type { PropsWithChildren } from 'react'

export function PageShell({ children }: PropsWithChildren) {
  return <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">{children}</div>
}
