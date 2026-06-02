import type { PropsWithChildren } from 'react'

interface DrawerProps {
  open: boolean
  onClose: () => void
}

export function Drawer({ open, onClose, children }: PropsWithChildren<DrawerProps>) {
  if (!open) {
    return null
  }
  return (
    <div className="fixed inset-0 z-40 flex bg-slate-950/80">
      <button className="w-16 bg-slate-950/90 text-slate-200" onClick={onClose}>
        Close
      </button>
      <div className="glass-surface h-full w-full max-w-sm border-l border-white/10 p-6 shadow-glow">
        {children}
      </div>
    </div>
  )
}
