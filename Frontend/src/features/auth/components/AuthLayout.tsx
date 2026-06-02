import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Mini header */}
      <header className="bg-white shadow-nav">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to={ROUTES.welcome} className="flex items-center">
            <span className="text-xl font-black text-brand-500">Novetta</span>
          </Link>
          <span className="text-xs text-gray-400">Secure Healthcare Platform</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </main>

      <footer className="py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Novetta Health Pvt. Ltd.
      </footer>
    </div>
  )
}
