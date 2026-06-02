import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { APP_NAME } from '../../constants/app'

export function AuthNavbar() {
  return (
    <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
      <Link to={ROUTES.welcome} className="flex items-center gap-3 text-sm font-semibold text-slate-100">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-emerald-400 text-white shadow-glow">
          N
        </span>
        <span>{APP_NAME}</span>
      </Link>
      <div className="hidden items-center gap-3 sm:flex">
        <span className="rounded-full bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate-400">
          Healthcare Demo
        </span>
      </div>
    </div>
  )
}
