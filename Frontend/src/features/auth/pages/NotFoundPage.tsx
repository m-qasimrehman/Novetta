import { Link } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'
import { SearchX } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
          <SearchX className="h-10 w-10 text-brand-500" />
        </div>
        <h1 className="text-6xl font-black text-brand-500">404</h1>
        <h2 className="mt-2 text-xl font-bold text-gray-800">Page Not Found</h2>
        <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          to={ROUTES.welcome}
          className="mt-6 inline-block rounded-lg bg-brand-500 px-8 py-3 text-sm font-bold text-white hover:bg-brand-600"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  )
}
