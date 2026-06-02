import { useLocation, useNavigate } from 'react-router-dom'
import { Clock, Video, Building2, Home, Calendar } from 'lucide-react'
import { Navbar } from '../../../components/layouts/Navbar'
import { Footer } from '../../../components/layouts/Footer'
import { ROUTES } from '../../../constants/routes'

export function AppointmentConfirmationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const appointment = location.state?.appointment

  if (!appointment) {
    navigate(ROUTES.appointments)
    return null
  }

  const typeIcons: Record<string, typeof Video> = {
    telehealth: Video,
    'in-clinic': Building2,
    'home-visit': Home,
  }
  const TypeIcon = typeIcons[appointment.consultationType] ?? Calendar
  const apptDate = appointment.appointmentDate ? new Date(appointment.appointmentDate) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-10 w-10 text-amber-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">Request Sent!</h1>
        <p className="mt-2 text-gray-500">Your appointment request is awaiting confirmation from the doctor.</p>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 text-left space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600 font-bold text-lg">
              {appointment.doctor?.user?.name?.split(' ').filter((_: any, i: number) => i > 0).map((p: string) => p[0]).join('').slice(0, 2) ?? 'DR'}
            </div>
            <div>
              <p className="font-bold text-gray-900">{appointment.doctor?.user?.name}</p>
              <p className="text-sm text-gray-500">{appointment.doctor?.specialization}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-500"><TypeIcon className="h-4 w-4" /> Type</span>
              <span className="font-semibold capitalize text-gray-800">{appointment.consultationType?.replace('-', ' ')}</span>
            </div>
            {apptDate && (
              <>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-500"><Calendar className="h-4 w-4" /> Date</span>
                  <span className="font-semibold text-gray-800">{apptDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-500"><Clock className="h-4 w-4" /> Time</span>
                  <span className="font-semibold text-gray-800">{apptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </>
            )}
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-gray-500">Confirmation Code</span>
              <span className="rounded-lg bg-brand-50 px-3 py-1 font-mono font-bold text-brand-600">
                {appointment.confirmationCode}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-left">
          <p className="font-semibold text-amber-800 flex items-center gap-2">
            <Clock className="h-4 w-4" /> Pending Doctor Approval
          </p>
          <p className="text-amber-700 mt-1">
            You will receive a notification once the doctor confirms or declines your request.
            {appointment.consultationType === 'telehealth' && ' The video room will be ready after confirmation.'}
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate(ROUTES.appointments)}
            className="flex-1 rounded-xl border border-gray-200 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            My Appointments
          </button>
          <button
            onClick={() => navigate(ROUTES.dashboard)}
            className="flex-1 rounded-xl bg-brand-500 py-3 font-semibold text-white hover:bg-brand-600"
          >
            Go to Dashboard
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
