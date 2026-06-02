import { useNavigate } from 'react-router-dom'
import { Navbar } from '../../../components/layouts/Navbar'
import { Footer } from '../../../components/layouts/Footer'
import { ROUTES } from '../../../constants/routes'
import { authStore } from '../../auth/store/authStore'
import {
  ShieldCheck, Clock, Truck, Star, BadgePercent,
  LayoutDashboard, FlaskConical, ChevronRight,
} from 'lucide-react'

const quickCategories = [
  { label: 'Pain Relief',   icon: '💊', href: ROUTES.pharmacy },
  { label: 'Vitamins',      icon: '🧴', href: ROUTES.pharmacy },
  { label: 'Diabetes Care', icon: '🩺', href: ROUTES.pharmacy },
  { label: 'Heart Care',    icon: '❤️', href: ROUTES.pharmacy },
  { label: 'Skin Care',     icon: '🌿', href: ROUTES.pharmacy },
  { label: 'Baby Care',     icon: '👶', href: ROUTES.pharmacy },
]

const healthConditions = [
  'Diabetes', 'Hypertension', 'Thyroid', 'Asthma', 'Arthritis', 'Digestive Care', 'Kidney Care', 'Eye Care',
]

const labTests = [
  { name: 'Complete Blood Count',  price: '₹299', discount: '40%' },
  { name: 'Thyroid Profile',       price: '₹499', discount: '35%' },
  { name: 'Blood Sugar (Fasting)', price: '₹99',  discount: '30%' },
  { name: 'Lipid Profile',         price: '₹349', discount: '25%' },
]

const features = [
  { icon: ShieldCheck, title: '100% Genuine',    desc: 'All medicines sourced from licensed distributors.' },
  { icon: Clock,       title: 'Express Delivery', desc: 'Same-day delivery available in select cities.' },
  { icon: Truck,       title: 'Free Delivery',   desc: 'On orders above ₹499. No hidden charges.' },
  { icon: Star,        title: 'Expert Verified', desc: 'All health content reviewed by certified doctors.' },
]

const offers = [
  { code: 'FIRST10', desc: 'Get 10% off on your first medicine order', min: '₹300' },
  { code: 'LAB50',   desc: '50% off on all lab tests',                min: '₹199' },
  { code: 'CONSULT', desc: '₹100 off on your first consultation',     min: 'No min' },
]

// Role-based hero config
const HERO_CONFIG: Record<string, { primary: { label: string; href: string }; secondary: { label: string; href: string } }> = {
  doctor: {
    primary:   { label: 'Doctor Panel',  href: ROUTES.doctorPanel },
    secondary: { label: 'My Appointments', href: ROUTES.appointments },
  },
  admin: {
    primary:   { label: 'Admin Panel',   href: ROUTES.admin },
    secondary: { label: 'View Analytics', href: ROUTES.admin },
  },
  patient: {
    primary:   { label: 'My Dashboard',  href: ROUTES.dashboard },
    secondary: { label: 'Find Doctors',  href: ROUTES.doctors },
  },
}

export function WelcomePage() {
  const navigate = useNavigate()
  const accessToken = authStore((s: any) => s.accessToken)
  const user        = authStore((s: any) => s.user)
  const role: string = (user as any)?.role ?? 'patient'

  const heroCfg = accessToken ? (HERO_CONFIG[role] ?? HERO_CONFIG.patient) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Banner */}
      <section className="brand-gradient text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-12 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex-1 space-y-4">
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              Healthcare Made Easy
            </span>
            <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              {accessToken
                ? `Welcome back, ${(user as any)?.name?.split(' ')[0] ?? 'there'}!`
                : <><span>Your Health,</span><br /><span>Our Priority</span></>}
            </h1>
            <p className="max-w-lg text-base text-white/90">
              {role === 'doctor'
                ? 'Manage your appointments, schedule, and patient consultations all in one place.'
                : role === 'admin'
                ? 'Monitor platform activity, manage users and doctors, and view analytics.'
                : 'Order genuine medicines, book lab tests at home, consult certified doctors — all in one place.'}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {heroCfg ? (
                <>
                  <button
                    onClick={() => navigate(heroCfg.primary.href)}
                    className="flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-brand-500 hover:bg-gray-50"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {heroCfg.primary.label}
                  </button>
                  <button
                    onClick={() => navigate(heroCfg.secondary.href)}
                    className="rounded-lg border border-white/40 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    {heroCfg.secondary.label}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate(ROUTES.register)}
                    className="rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-brand-500 hover:bg-gray-50"
                  >
                    Get Started Free
                  </button>
                  <button
                    onClick={() => navigate(ROUTES.guest)}
                    className="rounded-lg border border-white/40 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Browse as Guest
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Offer cards */}
          <div className="flex flex-1 flex-wrap justify-center gap-3">
            {offers.map(o => (
              <button
                key={o.code}
                onClick={() => navigate(ROUTES.membership)}
                className="rounded-xl bg-white/15 p-4 backdrop-blur-sm w-44 text-left hover:bg-white/25 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <BadgePercent className="h-4 w-4" />
                  <span className="text-xs font-bold tracking-widest">{o.code}</span>
                </div>
                <p className="text-xs text-white/90">{o.desc}</p>
                <p className="mt-1 text-[10px] text-white/60">Min: {o.min}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Shop by Category</h2>
          <button onClick={() => navigate(ROUTES.pharmacy)} className="flex items-center gap-1 text-sm text-brand-500 hover:underline">
            View All <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {quickCategories.map(c => (
            <button
              key={c.label}
              onClick={() => navigate(c.href)}
              className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 hover:border-brand-300 hover:shadow-card transition-all"
            >
              <span className="text-2xl">{c.icon}</span>
              <span className="text-xs font-semibold text-gray-700 text-center">{c.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Order by Health Condition */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-lg font-bold text-gray-800">Order by Health Condition</h2>
        <div className="flex flex-wrap gap-2">
          {healthConditions.map(c => (
            <button
              key={c}
              onClick={() => navigate(ROUTES.pharmacy)}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-400 hover:text-brand-500 transition-colors"
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Book Lab Tests at Home */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Book Lab Tests at Home</h2>
          <button onClick={() => navigate(ROUTES.labs)} className="flex items-center gap-1 text-sm text-brand-500 hover:underline">
            View All <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {labTests.map(t => (
            <button
              key={t.name}
              onClick={() => navigate(ROUTES.labs)}
              className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 text-left hover:border-brand-300 hover:shadow-card transition-all"
            >
              <FlaskConical className="h-5 w-5 text-brand-500" />
              <p className="text-sm font-semibold text-gray-800">{t.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-brand-500">{t.price}</span>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-600">{t.discount} off</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Consult a Doctor */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-card">
          <div className="brand-gradient p-6 text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold">Consult a Doctor Online</h2>
                <p className="mt-1 text-sm text-white/90">
                  Talk to verified doctors from the comfort of your home. Available 24/7.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['General Physician', 'Dermatologist', 'Gynaecologist', 'Psychiatrist', 'Paediatrician'].map(s => (
                    <button
                      key={s}
                      onClick={() => navigate(`${ROUTES.doctors}?specialization=${encodeURIComponent(s)}`)}
                      className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium hover:bg-white/30 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => navigate(accessToken ? ROUTES.doctors : ROUTES.register)}
                className="shrink-0 rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-brand-500 hover:bg-gray-50"
              >
                {accessToken ? 'Find a Doctor' : 'Book Consultation'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-gray-200 bg-white">
            {[
              { value: '50K+', label: 'Verified Doctors',    href: ROUTES.doctors },
              { value: '1M+',  label: 'Consultations Done',  href: ROUTES.doctors },
              { value: '4.8★', label: 'Average Rating',      href: ROUTES.doctors },
            ].map(stat => (
              <button key={stat.label} onClick={() => navigate(stat.href)} className="py-4 text-center hover:bg-gray-50 transition-colors">
                <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-card">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50">
                <Icon className="h-5 w-5 text-brand-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">{title}</h3>
                <p className="mt-1 text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sign-up CTA (guests only) */}
      {!accessToken && (
        <section className="border-t border-gray-200 bg-white py-10">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Join <span className="text-brand-500">500,000+</span> patients on Novetta
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Get personalised medicine reminders, order tracking, and health history all in one place.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate(ROUTES.register)}
                className="rounded-lg bg-brand-500 px-8 py-3 text-sm font-bold text-white hover:bg-brand-600"
              >
                Create Free Account
              </button>
              <button
                onClick={() => navigate(ROUTES.login)}
                className="rounded-lg border border-gray-200 bg-white px-8 py-3 text-sm font-semibold text-gray-700 hover:border-brand-400 hover:text-brand-500"
              >
                Sign In
              </button>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
