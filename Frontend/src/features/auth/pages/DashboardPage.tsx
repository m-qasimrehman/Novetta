import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { authStore } from '../store/authStore'
import { authService } from '../services/authService'
import { Navbar } from '../../../components/layouts/Navbar'
import { Footer } from '../../../components/layouts/Footer'
import { ROUTES } from '../../../constants/routes'
import {
  Stethoscope, Heart, Clock,
  FileText, Bell, ChevronRight, LogOut, User, ShieldCheck,
  LayoutDashboard, Users, Activity,
  Calendar, Home, Award, Crown, Package, Pill, FlaskConical,
} from 'lucide-react'

const PATIENT_ACTIONS = [
  { icon: Stethoscope,  label: 'Find Doctors',    color: 'text-green-500',  bg: 'bg-green-50',  href: ROUTES.doctors },
  { icon: Pill,         label: 'Order Medicines', color: 'text-red-500',    bg: 'bg-red-50',    href: ROUTES.pharmacy },
  { icon: Calendar,     label: 'Appointments',    color: 'text-blue-500',   bg: 'bg-blue-50',   href: ROUTES.appointments },
  { icon: FileText,     label: 'Prescriptions',   color: 'text-pink-500',   bg: 'bg-pink-50',   href: ROUTES.prescriptions },
  { icon: FlaskConical, label: 'Lab Tests',        color: 'text-amber-500',  bg: 'bg-amber-50',  href: ROUTES.labs },
  { icon: FileText,     label: 'My Records',       color: 'text-teal-500',   bg: 'bg-teal-50',   href: ROUTES.medicalRecords },
  { icon: Crown,        label: 'Membership',       color: 'text-purple-500', bg: 'bg-purple-50', href: ROUTES.membership },
  { icon: Bell,         label: 'Notifications',    color: 'text-indigo-500', bg: 'bg-indigo-50', href: ROUTES.notifications },
]

const DOCTOR_ACTIONS = [
  { icon: LayoutDashboard, label: 'My Panel',      color: 'text-indigo-500', bg: 'bg-indigo-50', href: ROUTES.doctorPanel },
  { icon: Calendar,        label: 'Appointments',  color: 'text-blue-500',   bg: 'bg-blue-50',   href: ROUTES.appointments },
  { icon: FileText,        label: 'Prescriptions', color: 'text-pink-500',   bg: 'bg-pink-50',   href: ROUTES.prescriptions },
  { icon: Stethoscope,     label: 'Find Doctors',  color: 'text-green-500',  bg: 'bg-green-50',  href: ROUTES.doctors },
  { icon: Home,            label: 'Home Visits',   color: 'text-orange-500', bg: 'bg-orange-50', href: ROUTES.doctorPanel },
  { icon: Award,           label: 'Certifications',color: 'text-amber-500',  bg: 'bg-amber-50',  href: ROUTES.doctorPanel },
  { icon: Bell,            label: 'Notifications', color: 'text-teal-500',   bg: 'bg-teal-50',   href: ROUTES.notifications },
  { icon: User,            label: 'My Profile',    color: 'text-gray-500',   bg: 'bg-gray-100',  href: ROUTES.profile },
]

const ADMIN_ACTIONS = [
  { icon: LayoutDashboard, label: 'Admin Panel',   color: 'text-rose-500',   bg: 'bg-rose-50',   href: ROUTES.admin },
  { icon: Users,           label: 'Manage Users',  color: 'text-blue-500',   bg: 'bg-blue-50',   href: ROUTES.admin },
  { icon: Stethoscope,     label: 'Doctors',       color: 'text-green-500',  bg: 'bg-green-50',  href: ROUTES.admin },
  { icon: Activity,        label: 'Analytics',     color: 'text-purple-500', bg: 'bg-purple-50', href: ROUTES.admin },
  { icon: Crown,           label: 'Memberships',   color: 'text-amber-500',  bg: 'bg-amber-50',  href: ROUTES.admin },
  { icon: Package,         label: 'Orders',        color: 'text-teal-500',   bg: 'bg-teal-50',   href: ROUTES.admin },
  { icon: Bell,            label: 'Notifications', color: 'text-indigo-500', bg: 'bg-indigo-50', href: ROUTES.notifications },
  { icon: User,            label: 'My Profile',    color: 'text-gray-500',   bg: 'bg-gray-100',  href: ROUTES.profile },
]

const healthTips = [
  'Drink at least 8 glasses of water daily.',
  'Take prescribed medicines on time.',
  'Schedule your annual health checkup.',
  'Get 7–8 hours of sleep every night.',
]

const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
  doctor: { label: 'Doctor',  color: 'text-indigo-700', bg: 'bg-indigo-100' },
  admin:  { label: 'Admin',   color: 'text-rose-700',   bg: 'bg-rose-100'   },
  patient:{ label: 'Patient', color: 'text-brand-700',  bg: 'bg-brand-100'  },
}

export function DashboardPage() {
  const navigate = useNavigate()
  const user       = authStore((s: any) => s.user)
  const accessToken = authStore((s: any) => s.accessToken)
  const role = (user as any)?.role ?? 'patient'

  // Auto-redirect non-patient roles to their dedicated panel
  useEffect(() => {
    if (!role) return
    if (role === 'doctor') { navigate(ROUTES.doctorPanel, { replace: true }); return }
    if (role === 'admin')  { navigate(ROUTES.admin,       { replace: true }); return }
  }, [role, navigate])

  useEffect(() => {
    if (!user && accessToken) {
      authService.getProfile().then((profile) => {
        if (profile) authStore.getState().setAuth({
          user: profile,
          accessToken: authStore.getState().accessToken,
          refreshToken: authStore.getState().refreshToken,
          expiresAt: authStore.getState().expiresAt,
        })
      }).catch(() => {})
    }
  }, [user, accessToken])

  const initials = useMemo(() => {
    if (!user) return 'U'
    return (user.name as string).split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase()
  }, [user])

  const handleLogout = () => {
    authStore.getState().clearAuth()
    navigate(ROUTES.login)
  }

  const actions = role === 'doctor' ? DOCTOR_ACTIONS : role === 'admin' ? ADMIN_ACTIONS : PATIENT_ACTIONS
  const roleMeta = ROLE_META[role] ?? ROLE_META.patient

  // While redirecting for doctor/admin show nothing
  if (role === 'doctor' || role === 'admin') return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">

        {/* Welcome banner */}
        <div className="overflow-hidden rounded-xl brand-gradient text-white shadow-card">
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20 text-xl font-bold">
                {initials}
              </div>
              <div>
                <p className="text-sm text-white/80">Welcome back,</p>
                <h1 className="text-2xl font-bold">{(user as any)?.name ?? 'Patient'}</h1>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-xs text-white/70">{(user as any)?.email}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${roleMeta.bg} ${roleMeta.color}`}>
                    {roleMeta.label}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate(ROUTES.notifications)} className="flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium hover:bg-white/25">
                <Bell className="h-4 w-4" /> Notifications
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium hover:bg-white/25">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </div>
          {/* Stats strip */}
          <div className="grid grid-cols-3 divide-x divide-white/20 bg-white/10">
            {[
              { label: 'Orders',        value: '3', href: ROUTES.pharmacyOrders },
              { label: 'Lab Tests',     value: '1', href: ROUTES.labs },
              { label: 'Appointments',  value: '1', href: ROUTES.appointments },
            ].map(s => (
              <button key={s.label} onClick={() => navigate(s.href)} className="py-3 text-center hover:bg-white/10 transition-colors">
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-[11px] text-white/70">{s.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {actions.map(({ icon: Icon, label, color, bg, href }) => (
            <button
              key={label}
              onClick={() => navigate(href)}
              className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 hover:shadow-card transition-shadow"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <span className="text-center text-sm font-semibold text-gray-700">{label}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent activity */}
          <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brand-500" /> Recent Activity
              </h2>
              <button onClick={() => navigate(ROUTES.appointments)} className="flex items-center gap-1 text-xs text-brand-500 hover:underline">
                View All <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { id: '#OR-001', name: 'Aspirin 75mg × 10 strips', status: 'Delivered', date: '18 May 2026', color: 'text-green-600', bg: 'bg-green-50', href: ROUTES.pharmacyOrders },
                { id: '#OR-002', name: 'CBC + Thyroid Profile',    status: 'Scheduled', date: '20 May 2026', color: 'text-blue-600',  bg: 'bg-blue-50',  href: ROUTES.labs },
                { id: '#OR-003', name: 'Dr. Umar Consultation',    status: 'Upcoming',  date: '21 May 2026', color: 'text-amber-600', bg: 'bg-amber-50', href: ROUTES.appointments },
              ].map(order => (
                <button
                  key={order.id}
                  onClick={() => navigate(order.href)}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-100 p-3 text-left hover:border-brand-200 hover:bg-brand-50/30 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{order.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{order.id} · {order.date}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${order.bg} ${order.color}`}>
                    {order.status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Profile card */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-brand-500" />
                  <h3 className="text-sm font-bold text-gray-800">My Profile</h3>
                </div>
                <button onClick={() => navigate(ROUTES.profile)} className="text-xs text-brand-500 hover:underline">Edit</button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Name</span>
                  <span className="font-medium text-gray-800">{(user as any)?.name ?? '—'}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Email</span>
                  <span className="font-medium text-gray-800 truncate max-w-[120px]">{(user as any)?.email ?? '—'}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Phone</span>
                  <span className="font-medium text-gray-800">{(user as any)?.phone ?? '—'}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Status</span>
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Health tips */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
              <div className="mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4 text-brand-500" />
                <h3 className="text-sm font-bold text-gray-800">Daily Health Tips</h3>
              </div>
              <ul className="space-y-2">
                {healthTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Upload prescription */}
            <div className="rounded-xl border border-dashed border-brand-300 bg-brand-50 p-5 text-center">
              <FileText className="mx-auto h-8 w-8 text-brand-400 mb-2" />
              <p className="text-sm font-semibold text-brand-600">Upload Prescription</p>
              <p className="mt-1 text-xs text-gray-500">Order medicines directly from your doctor's prescription</p>
              <button
                onClick={() => navigate(ROUTES.pharmacyScan)}
                className="mt-3 rounded-lg bg-brand-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
              >
                Upload Now
              </button>
            </div>
          </div>
        </div>

        {/* Appointment reminder */}
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-50">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Upcoming Appointment</h3>
              <p className="text-sm text-gray-500">Dr. Umar – General Physician · 21 May 2026 at 10:00 AM</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(ROUTES.appointments)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Reschedule
            </button>
            <button
              onClick={() => navigate(ROUTES.appointments)}
              className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
            >
              Join Call
            </button>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  )
}
