import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authStore } from '../store/authStore'
import { ROUTES } from '../../../constants/routes'

export function SplashPage() {
  const navigate = useNavigate()
  const accessToken = authStore((store: { accessToken: string | null }) => store.accessToken)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate(ROUTES.welcome, { replace: true })
    }, 2000)
    return () => window.clearTimeout(timer)
  }, [accessToken, navigate])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-500">
      <div className="flex flex-col items-center gap-5 text-white">
        <div className="flex items-center justify-center rounded-2xl bg-white shadow-lg px-6 py-4">
          <span className="text-4xl font-black text-brand-500">Novetta</span>
        </div>
        <div className="text-center">
          <p className="mt-2 text-sm text-white/80">Your Trusted Healthcare Platform</p>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <span className="h-2 w-2 animate-bounce rounded-full bg-white" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-white" style={{ animationDelay: '150ms' }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-white" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
