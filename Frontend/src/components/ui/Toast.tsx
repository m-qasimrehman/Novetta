export interface ToastMessage {
  id: string
  title: string
  description?: string
  variant: 'success' | 'error' | 'info'
}

function safeString(val: unknown): string {
  if (!val) return ''
  if (typeof val === 'string') return val
  if (Array.isArray(val)) return val.map(String).join(', ')
  if (typeof val === 'object') return (val as any).message ?? JSON.stringify(val)
  return String(val)
}

interface ToastViewportProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

const variantStyles: Record<ToastMessage['variant'], string> = {
  success: 'border-green-200 bg-white text-green-800 shadow-lg',
  error:   'border-red-200   bg-white text-red-800   shadow-lg',
  info:    'border-blue-200  bg-white text-blue-800  shadow-lg',
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-4 sm:top-8">
      <div className="flex w-full max-w-xl flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl border px-4 py-4 ${variantStyles[toast.variant]} animate-slide-in`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{safeString(toast.title)}</p>
                {toast.description && <p className="mt-0.5 text-sm text-gray-600">{safeString(toast.description)}</p>}
              </div>
              <button
                type="button"
                className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
                onClick={() => onDismiss(toast.id)}
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
