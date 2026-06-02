import type { ReactNode } from 'react'

interface AuthCardProps {
  title: string
  description?: string
  children: ReactNode
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-card">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        {description && <p className="mt-1.5 text-sm text-gray-500">{description}</p>}
      </div>
      {children}
    </div>
  )
}
