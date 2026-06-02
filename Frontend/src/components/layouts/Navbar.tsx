import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, MapPin, Menu, X, User, ChevronDown, Stethoscope, Calendar, FileText, LayoutDashboard, FlaskConical, Bell, ShoppingCart, ShieldCheck, Tablets, Pill, FlaskRound, Package2, Crown } from 'lucide-react'
import { authStore } from '../../features/auth/store/authStore'
import { ROUTES } from '../../constants/routes'

const NAV_LINKS = [
  { label: 'Find Doctors',  href: ROUTES.doctors,        icon: Stethoscope },
  { label: 'Pharmacy',      href: ROUTES.pharmacy,       icon: Pill },
  { label: 'Pharmacist',    href: ROUTES.telePharmacist, icon: FlaskRound },
  { label: 'Lab Tests',     href: ROUTES.labs,           icon: FlaskConical },
  { label: 'Appointments',  href: ROUTES.appointments,   icon: Calendar,        protected: true },
  { label: 'Prescriptions', href: ROUTES.prescriptions,  icon: FileText,        protected: true },
  { label: 'My Orders',     href: ROUTES.pharmacyOrders, icon: Package2,        protected: true },
  { label: 'Records',       href: ROUTES.medicalRecords, icon: FileText,        protected: true },
  { label: 'Membership',    href: ROUTES.membership,     icon: Crown,           protected: true },
  { label: 'Notifications', href: ROUTES.notifications,  icon: Bell,            protected: true },
  { label: 'Dashboard',     href: ROUTES.dashboard,      icon: LayoutDashboard, protected: true },
  { label: 'Doctor Panel',      href: ROUTES.doctorPanel,       icon: Stethoscope, protected: true, role: 'doctor'      as const },
  { label: 'Admin Panel',       href: ROUTES.admin,             icon: ShieldCheck, protected: true, role: 'admin'       as const },
  { label: 'Pharmacist Console', href: ROUTES.pharmacistConsole, icon: Tablets,      protected: true, role: 'pharmacist'      as const },
  { label: 'Lab Coordinator',    href: ROUTES.labCoordinator,    icon: FlaskConical,  protected: true, role: 'lab_coordinator' as const },
]

export function Navbar() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const { accessToken, user } = authStore((s: any) => ({ accessToken: s.accessToken, user: s.user }))

  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (search.trim()) navigate(`${ROUTES.doctors}?q=${encodeURIComponent(search)}`)
  }

  const userRole = (user as any)?.role
  const visibleLinks = NAV_LINKS.filter(l => {
    if (l.protected && !accessToken) return false
    if ((l as any).role && (l as any).role !== userRole) return false
    return true
  })

  return (
    <header className="sticky top-0 z-50 bg-white shadow-nav">
      {/* Top bar */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to={ROUTES.welcome} className="flex shrink-0 items-center">
          <span className="text-2xl font-black text-brand-500">Novetta</span>
        </Link>

        {/* Location */}
        <button className="hidden shrink-0 items-center gap-1 text-sm text-gray-600 hover:text-brand-500 sm:flex">
          <MapPin className="h-4 w-4 text-brand-500" />
          <span className="max-w-[80px] truncate font-medium">Deliver to</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex flex-1 items-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 focus-within:border-brand-400 focus-within:ring-1 focus-within:ring-brand-200">
          <Search className="ml-3 h-4 w-4 shrink-0 text-gray-400" />
          <input
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
            placeholder="Search doctors, medicines, lab tests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="mr-1 rounded-md bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600">
            Search
          </button>
        </form>

        {/* Right actions */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            className="relative hidden p-1.5 text-gray-600 hover:text-brand-500 sm:block"
            onClick={() => navigate(ROUTES.pharmacy)}
          >
            <ShoppingCart className="h-5 w-5" />
          </button>

          {accessToken ? (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => navigate(ROUTES.profile)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-brand-400 hover:text-brand-500"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:block">{(user as any)?.name?.split(' ')[0] ?? 'Account'}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate(ROUTES.login)}
              className="hidden sm:block rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Sign In
            </button>
          )}

          <button className="sm:hidden" onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Category nav */}
      <nav className="hidden border-t border-gray-100 bg-white sm:block">
        <div className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
          {visibleLinks.map(link => {
            const Icon = link.icon
            return (
              <Link
                key={link.label}
                to={link.href}
                className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-brand-500 whitespace-nowrap py-1 transition-colors"
              >
                <Icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 sm:hidden">
          {visibleLinks.map(link => {
            const Icon = link.icon
            return (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 w-full py-2.5 text-left text-sm font-medium text-gray-700 hover:text-brand-500"
              >
                <Icon className="h-4 w-4" /> {link.label}
              </Link>
            )
          })}
          <div className="mt-3 border-t border-gray-100 pt-3 flex gap-3">
            {accessToken ? (
              <button
                onClick={() => { navigate(ROUTES.profile); setMenuOpen(false) }}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-brand-500 py-2 text-sm font-semibold text-brand-500"
              >
                <User className="h-4 w-4" /> Profile
              </button>
            ) : (
              <>
                <button onClick={() => { navigate(ROUTES.login); setMenuOpen(false) }} className="flex-1 rounded-lg bg-brand-500 py-2 text-sm font-semibold text-white">
                  Sign In
                </button>
                <button onClick={() => { navigate(ROUTES.register); setMenuOpen(false) }} className="flex-1 rounded-lg border border-brand-500 py-2 text-sm font-semibold text-brand-500">
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
