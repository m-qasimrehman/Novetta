import type { PropsWithChildren } from 'react'

interface ModalProps {
  title: string
  open: boolean
  onClose: () => void
}

export function Modal({ title, open, onClose, children }: PropsWithChildren<ModalProps>) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="glass-surface w-full max-w-2xl rounded-[2rem] border border-white/10 p-6 shadow-glow">
        <div className="flex items-center justify-between gap-4 pb-4">
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          <button className="rounded-full bg-white/5 px-3 py-2 text-sm text-slate-200" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
