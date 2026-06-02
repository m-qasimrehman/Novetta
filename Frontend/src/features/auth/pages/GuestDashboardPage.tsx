import { useNavigate } from 'react-router-dom'
import { Navbar } from '../../../components/layouts/Navbar'
import { Footer } from '../../../components/layouts/Footer'
import { ROUTES } from '../../../constants/routes'
import { Pill, FlaskConical, Stethoscope, Lock } from 'lucide-react'

const previewFeatures = [
  { icon: Pill,         label: 'Order Medicines',  desc: 'Browse 1M+ genuine medicines' },
  { icon: FlaskConical, label: 'Lab Tests',        desc: 'Book at-home sample collection' },
  { icon: Stethoscope,  label: 'Consult Doctors',  desc: 'Chat with verified physicians' },
]

export function GuestDashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* Guest banner */}
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-6 text-center mb-8">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-card">
            <Lock className="h-7 w-7 text-brand-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">You're browsing as a Guest</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in or create an account to access your orders, prescriptions, and health records.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate(ROUTES.login)}
              className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate(ROUTES.register)}
              className="rounded-lg border border-brand-500 px-6 py-2.5 text-sm font-bold text-brand-500 hover:bg-brand-50"
            >
              Create Free Account
            </button>
          </div>
        </div>

        {/* Preview features */}
        <h2 className="mb-4 text-base font-bold text-gray-800">What you can do after signing in:</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {previewFeatures.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-card text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
                <Icon className="h-6 w-6 text-brand-500" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">{label}</h3>
              <p className="mt-1 text-xs text-gray-500">{desc}</p>
            </div>
          ))}
        </div>

        <button
          className="mt-6 block w-full text-center text-sm text-gray-400 hover:text-gray-600"
          onClick={() => navigate(ROUTES.welcome)}
        >
          ← Back to homepage
        </button>
      </div>

      <Footer />
    </div>
  )
}
