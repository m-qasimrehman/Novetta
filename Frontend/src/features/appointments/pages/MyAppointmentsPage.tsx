import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendar, Video, Building2, Home, Clock, CheckCircle, XCircle, ChevronRight, AlertCircle, Star } from 'lucide-react'
import { Navbar } from '../../../components/layouts/Navbar'
import { Footer } from '../../../components/layouts/Footer'
import { appointmentsApi, type Appointment } from '../../../lib/api'
import { ROUTES } from '../../../constants/routes'

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string; icon: typeof CheckCircle }> = {
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-600', icon: Clock },
  confirmed: { label: 'Confirmed', bg: 'bg-green-50', text: 'text-green-600', icon: CheckCircle },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-500', icon: XCircle },
  completed: { label: 'Completed', bg: 'bg-gray-100', text: 'text-gray-500', icon: CheckCircle },
}

const TYPE_ICONS: Record<string, typeof Video> = {
  telehealth: Video,
  'in-clinic': Building2,
  'home-visit': Home,
}

function AppointmentCard({ appointment, onCancel }: { appointment: Appointment; onCancel: (id: string) => void }) {
  const navigate = useNavigate()
  const status = STATUS_STYLES[appointment.status] ?? STATUS_STYLES.pending
  const StatusIcon = status.icon
  const TypeIcon = TYPE_ICONS[appointment.consultationType ?? ''] ?? Calendar
  const apptDate = appointment.appointmentDate ? new Date(appointment.appointmentDate) : null
  const session = appointment.telehealthSessions?.[0]

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 font-bold">
            {appointment.doctor.user.name.split(' ').filter((_, i) => i > 0).map(p => p[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-bold text-gray-900">{appointment.doctor.user.name}</p>
            <p className="text-sm text-brand-600">{appointment.doctor.specialization}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-0.5"><TypeIcon className="h-3.5 w-3.5" /> {appointment.consultationType?.replace('-', ' ')}</span>
              {apptDate && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {apptDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-3.5 w-3.5" />
                    {apptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </>
              )}
            </div>
            {appointment.confirmationCode && (
              <p className="mt-1 text-xs text-gray-400">Code: <span className="font-mono font-semibold text-gray-600">{appointment.confirmationCode}</span></p>
            )}
          </div>
        </div>

        <span className={`flex w-fit items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${status.bg} ${status.text}`}>
          <StatusIcon className="h-3 w-3" /> {status.label}
        </span>
      </div>

      {appointment.reason && (
        <p className="mt-3 rounded-lg bg-gray-50 p-2.5 text-xs text-gray-600">
          <span className="font-semibold">Reason: </span>{appointment.reason}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {appointment.status === 'pending' && (
          <span className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700">
            <Clock className="h-3.5 w-3.5" /> Awaiting doctor confirmation
          </span>
        )}
        {appointment.consultationType === 'telehealth' && session && appointment.status === 'confirmed' && (
          <button
            onClick={() => navigate(ROUTES.telehealth(session.id))}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <Video className="h-3.5 w-3.5" /> Join Call
          </button>
        )}
        {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
          <button
            onClick={() => onCancel(appointment.id)}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
          >
            <XCircle className="h-3.5 w-3.5" /> Cancel
          </button>
        )}
        {appointment.status === 'completed' && (
          <button
            onClick={() => navigate(`${ROUTES.doctorProfile(appointment.doctorId)}?tab=reviews`)}
            className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
          >
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> Leave Review
          </button>
        )}
        <button
          onClick={() => navigate(ROUTES.doctorProfile(appointment.doctorId))}
          className="flex items-center gap-1 text-xs text-brand-500 hover:underline ml-auto"
        >
          View Doctor <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

export function MyAppointmentsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentsApi.list().then(r => r.data.data),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => appointmentsApi.cancel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  })

  const appointments: Appointment[] = data ?? []
  const now = new Date()

  const filtered = appointments.filter(a => {
    if (filter === 'upcoming') return a.appointmentDate && new Date(a.appointmentDate) >= now && a.status !== 'cancelled'
    if (filter === 'past') return !a.appointmentDate || new Date(a.appointmentDate) < now || a.status === 'cancelled'
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-sm text-gray-500 mt-1">{appointments.length} total appointments</p>
          </div>
          <button
            onClick={() => navigate(ROUTES.doctors)}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Book New
          </button>
        </div>

        {/* Filter tabs */}
        <div className="mb-5 flex gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          {(['all', 'upcoming', 'past'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition-all ${filter === f ? 'bg-brand-500 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-36 animate-pulse rounded-xl bg-gray-200" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-400 font-medium">No appointments found</p>
            <button onClick={() => navigate(ROUTES.doctors)} className="mt-4 rounded-lg bg-brand-500 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-600">
              Find a Doctor
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(a => (
              <AppointmentCard key={a.id} appointment={a} onCancel={id => cancelMutation.mutate(id)} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
