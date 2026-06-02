import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  LayoutDashboard, User, Calendar, Award, Home, Wifi, WifiOff,
  Save, Plus, Trash2, Check, X, Clock, Star, TrendingUp, Users,
  Activity, Edit3, LogOut, MessageSquare, DollarSign,
  ChevronLeft, ChevronRight, Phone, Video, MapPin, Send, RefreshCw,
  AlertCircle, CheckCircle, XCircle, Pill, Eye,
} from 'lucide-react'
import { authStore } from '../../auth/store/authStore'
import {
  doctorPanelApi, type DoctorPanelProfile, type AvailabilitySlot,
  type DoctorAppointment, type DoctorPrescription,
} from '../../../lib/api'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'
import { Navbar } from '../../../components/layouts/Navbar'

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SLOT_DURATIONS = [10, 15, 20, 30, 45, 60]
const CONSULTATION_TYPES = ['in-clinic', 'online', 'home-visit']
const COMMON_LANGUAGES = ['English', 'Urdu', 'Punjabi', 'Sindhi', 'Pashto', 'Balochi', 'Arabic']
const SPECIALIZATIONS = [
  'General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician',
  'Orthopedic Surgeon', 'Gynecologist', 'Neurologist', 'Psychiatrist',
  'ENT Specialist', 'Ophthalmologist', 'Urologist', 'Gastroenterologist',
  'Endocrinologist', 'Pulmonologist', 'Nephrologist', 'Oncologist',
]

type Tab = 'overview' | 'appointments' | 'patients' | 'prescriptions' | 'analytics' | 'profile' | 'availability' | 'certifications' | 'home-visits' | 'chat'

interface DaySlot { startTime: string; endTime: string; slotDurationMin: number }
type WeekSchedule = { enabled: boolean; slots: DaySlot[] }[]

function initWeekSchedule(existing: AvailabilitySlot[]): WeekSchedule {
  return DAYS.map((_, i) => {
    const daySlots = existing.filter(s => s.dayOfWeek === i)
    return {
      enabled: daySlots.length > 0,
      slots: daySlots.length > 0
        ? daySlots.map(s => ({ startTime: s.startTime, endTime: s.endTime, slotDurationMin: s.slotDurationMin }))
        : [{ startTime: '09:00', endTime: '17:00', slotDurationMin: 30 }],
    }
  })
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, sub }: { label: string; value: string | number; icon: any; color: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className={`mb-3 inline-flex rounded-lg p-2 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="mt-0.5 text-sm text-gray-500">{label}</div>
      {sub && <div className="mt-1 text-xs text-gray-400">{sub}</div>}
    </div>
  )
}

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      {title && <h3 className="mb-4 text-base font-semibold text-gray-900">{title}</h3>}
      {children}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    scheduled: 'bg-purple-100 text-purple-700',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

function Spinner() {
  return <div className="flex justify-center py-10"><div className="h-7 w-7 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ stats, isOnline, onToggleOnline }: { stats: any; isOnline: boolean; onToggleOnline: (v: boolean) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Today's Appointments" value={stats?.todayCount ?? 0} icon={Calendar} color="bg-blue-50 text-blue-600" />
        <StatCard label="This Week" value={stats?.weekCount ?? 0} icon={TrendingUp} color="bg-indigo-50 text-indigo-600" />
        <StatCard label="Completed" value={stats?.completed ?? 0} icon={CheckCircle} color="bg-green-50 text-green-600" />
        <StatCard label="Total Earnings" value={`Rs ${(stats?.revenue ?? 0).toLocaleString()}`} icon={DollarSign} color="bg-amber-50 text-amber-600" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Pending" value={stats?.pending ?? 0} icon={Clock} color="bg-amber-50 text-amber-600" />
        <StatCard label="Confirmed" value={stats?.confirmed ?? 0} icon={Activity} color="bg-cyan-50 text-cyan-600" />
        <StatCard label="Rating" value={`${(stats?.rating ?? 0).toFixed(1)} ★`} icon={Star} color="bg-yellow-50 text-yellow-600" sub={`${stats?.totalReviews ?? 0} reviews`} />
        <StatCard label="Total" value={stats?.total ?? 0} icon={Users} color="bg-purple-50 text-purple-600" />
      </div>

      <SectionCard title="Online Status">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">
              {isOnline ? 'You are online and accepting chats' : 'You are offline'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Auto-away triggers after 5 minutes of inactivity</p>
          </div>
          <button
            onClick={() => onToggleOnline(!isOnline)}
            className={`flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition-colors ${isOnline ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600'}`}
          >
            {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            {isOnline ? 'Online' : 'Offline'}
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Upcoming Appointments">
        {!stats?.upcoming?.length ? (
          <p className="py-4 text-center text-sm text-gray-400">No upcoming appointments</p>
        ) : (
          <div className="space-y-3">
            {stats.upcoming.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.patient.name}</p>
                  <p className="text-xs text-gray-500">{a.consultationType ?? 'Not specified'} · {a.appointmentDate ? new Date(a.appointmentDate).toLocaleString() : 'TBD'}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}

// ─── Appointments Tab ─────────────────────────────────────────────────────────

function AppointmentsTab() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [rescheduleId, setRescheduleId] = useState<string | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['doctor-panel', 'appointments', statusFilter, page],
    queryFn: () => doctorPanelApi.getAppointments(statusFilter, page).then(r => r.data),
    refetchInterval: 20000,
  })

  const statusMut = useMutation({
    mutationFn: ({ id, status, newDate }: { id: string; status: string; newDate?: string }) =>
      doctorPanelApi.updateAppointmentStatus(id, status, newDate),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['doctor-panel', 'appointments'] }); setRescheduleId(null) },
  })

  const appointments: DoctorAppointment[] = (data as any)?.data ?? []
  const total: number = (data as any)?.total ?? 0
  const pages: number = (data as any)?.pages ?? 1
  const pendingCount = appointments.filter(a => a.status === 'pending').length

  return (
    <div className="space-y-4">
      {/* Pending requests banner */}
      {statusFilter === 'all' && pendingCount > 0 && (
        <button
          onClick={() => setStatusFilter('pending')}
          className="flex w-full items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left hover:bg-amber-100 transition-colors"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500">
            <AlertCircle className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              {pendingCount} new appointment {pendingCount === 1 ? 'request' : 'requests'} awaiting your response
            </p>
            <p className="text-xs text-amber-600">Click to view pending requests</p>
          </div>
          <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white">{pendingCount}</span>
        </button>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${statusFilter === s ? 'bg-brand-500 text-white' : 'border border-gray-200 text-gray-600 hover:border-brand-300'}`}>
            {s}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-400 self-center">{total} total</span>
      </div>

      {isLoading ? <Spinner /> : appointments.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">No appointments found</p>
      ) : (
        <div className="space-y-3">
          {appointments.map(a => {
            const session = a.telehealthSessions?.[0]
            const isTelehealth = a.consultationType === 'online' || a.consultationType === 'telehealth'
            return (
              <div key={a.id} className={`rounded-xl border bg-white p-4 shadow-sm ${a.status === 'pending' ? 'border-l-4 border-amber-400 border-t-amber-100 border-r-amber-100 border-b-amber-100' : 'border-gray-100'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{a.patient.name}</p>
                      <StatusBadge status={a.status} />
                      {a.consultationType && (
                        <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          {isTelehealth ? <Video className="h-3 w-3" /> : a.consultationType === 'home-visit' ? <Home className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                          {a.consultationType}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{a.patient.email} · {a.patient.phone ?? 'No phone'}</p>
                    {a.reason && <p className="mt-1 text-sm text-gray-600 italic">"{a.reason}"</p>}
                    <p className="mt-1 text-xs text-gray-400">
                      {a.appointmentDate ? new Date(a.appointmentDate).toLocaleString() : 'Date TBD'}
                      {a.paymentStatus === 'paid' && ` · Rs ${Number(a.paymentAmount ?? 0).toLocaleString()} paid`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {a.status === 'pending' && (
                      <>
                        <button onClick={() => statusMut.mutate({ id: a.id, status: 'confirmed' })}
                          className="flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600">
                          <Check className="h-3 w-3" /> Accept
                        </button>
                        <button onClick={() => statusMut.mutate({ id: a.id, status: 'cancelled' })}
                          className="flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600">
                          <X className="h-3 w-3" /> Decline
                        </button>
                      </>
                    )}
                    {a.status === 'confirmed' && (
                      <>
                        <button onClick={() => statusMut.mutate({ id: a.id, status: 'completed' })}
                          className="flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600">
                          <CheckCircle className="h-3 w-3" /> Complete
                        </button>
                        <button onClick={() => setRescheduleId(a.id)}
                          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-brand-300">
                          <Clock className="h-3 w-3" /> Reschedule
                        </button>
                        {isTelehealth && session && (
                          <button onClick={() => navigate(ROUTES.telehealth(session.id))}
                            className="flex items-center gap-1 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-600">
                            <Video className="h-3 w-3" /> Join Call
                          </button>
                        )}
                      </>
                    )}
                    {a.status === 'confirmed' && (
                      <button onClick={() => statusMut.mutate({ id: a.id, status: 'cancelled' })}
                        className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                        <XCircle className="h-3 w-3" /> Cancel
                      </button>
                    )}
                  </div>
                </div>
                {rescheduleId === a.id && (
                  <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                    <input type="datetime-local" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)}
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-brand-400 focus:outline-none" />
                    <button onClick={() => statusMut.mutate({ id: a.id, status: 'confirmed', newDate: rescheduleDate })}
                      disabled={!rescheduleDate}
                      className="rounded-lg bg-brand-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
                      Confirm
                    </button>
                    <button onClick={() => setRescheduleId(null)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="rounded-lg border border-gray-200 p-1.5 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
          <span className="text-sm text-gray-600">{page} / {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            className="rounded-lg border border-gray-200 p-1.5 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  )
}

// ─── Patients Tab ─────────────────────────────────────────────────────────────

function PatientsTab() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)

  const { data: apptData } = useQuery({
    queryKey: ['doctor-panel', 'appointments', 'all', 1],
    queryFn: () => doctorPanelApi.getAppointments('all', 1).then(r => r.data),
  })

  const appointments: DoctorAppointment[] = (apptData as any)?.data ?? []
  const uniquePatients = Array.from(
    new Map(appointments.map(a => [a.patient.id, a.patient])).values()
  )

  const { data: records, isLoading: loadingRecords } = useQuery({
    queryKey: ['doctor-panel', 'patient-records', selectedPatientId],
    queryFn: () => doctorPanelApi.getPatientRecords(selectedPatientId!).then(r => r.data),
    enabled: !!selectedPatientId,
  })

  const patientData = (records as any)?.data

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {uniquePatients.map(p => (
          <button key={p.id} onClick={() => setSelectedPatientId(p.id)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${selectedPatientId === p.id ? 'bg-brand-500 text-white border-brand-500' : 'border-gray-200 text-gray-600 hover:border-brand-300'}`}>
            <User className="h-3.5 w-3.5" />{p.name}
          </button>
        ))}
        {uniquePatients.length === 0 && <p className="text-sm text-gray-400">No patients yet — they appear after appointments are booked.</p>}
      </div>

      {selectedPatientId && (
        loadingRecords ? <Spinner /> : patientData ? (
          <div className="space-y-4">
            {/* Patient info */}
            <SectionCard title="Patient Info">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-400">Name</span><p className="font-medium text-gray-900">{patientData.patient?.name}</p></div>
                <div><span className="text-gray-400">Email</span><p className="font-medium text-gray-900">{patientData.patient?.email}</p></div>
                <div><span className="text-gray-400">Phone</span><p className="font-medium text-gray-900">{patientData.patient?.phone ?? '—'}</p></div>
                <div><span className="text-gray-400">Member since</span><p className="font-medium text-gray-900">{new Date(patientData.patient?.createdAt).toLocaleDateString()}</p></div>
              </div>
            </SectionCard>

            {/* Medical history */}
            <SectionCard title={`Medical History (${patientData.medicalHistory?.length ?? 0})`}>
              {patientData.medicalHistory?.length === 0 ? (
                <p className="text-sm text-gray-400">No medical history on record</p>
              ) : (
                <div className="space-y-2">
                  {patientData.medicalHistory?.map((h: any) => (
                    <div key={h.id} className="flex items-start justify-between rounded-lg bg-gray-50 p-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{h.condition}</p>
                        {h.notes && <p className="text-gray-500">{h.notes}</p>}
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${h.isCurrent ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                        {h.isCurrent ? 'Active' : 'Resolved'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Medical records */}
            <SectionCard title={`Uploaded Records (${patientData.medicalRecords?.length ?? 0})`}>
              {patientData.medicalRecords?.length === 0 ? (
                <p className="text-sm text-gray-400">No documents uploaded</p>
              ) : (
                <div className="space-y-2">
                  {patientData.medicalRecords?.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{r.title ?? 'Untitled'}</p>
                        <p className="text-xs text-gray-400">{r.recordType ?? 'Document'} · {new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                      {r.fileUrl && <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-500 hover:underline text-xs"><Eye className="h-3 w-3" />View</a>}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Previous notes */}
            <SectionCard title={`Your Previous Consultation Notes (${patientData.previousNotes?.length ?? 0})`}>
              {patientData.previousNotes?.length === 0 ? (
                <p className="text-sm text-gray-400">No previous consultation notes</p>
              ) : (
                <div className="space-y-2">
                  {patientData.previousNotes?.map((n: any) => (
                    <div key={n.id} className="rounded-lg bg-blue-50 p-3 text-sm">
                      {n.diagnosis && <p className="font-medium text-gray-900">Diagnosis: {n.diagnosis}</p>}
                      {n.notes && <p className="text-gray-600 mt-0.5">{n.notes}</p>}
                      <p className="mt-1 text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Previous prescriptions */}
            <SectionCard title={`Previous Prescriptions (${patientData.previousPrescriptions?.length ?? 0})`}>
              {patientData.previousPrescriptions?.length === 0 ? (
                <p className="text-sm text-gray-400">No prescriptions issued to this patient</p>
              ) : (
                <div className="space-y-3">
                  {patientData.previousPrescriptions?.map((rx: any) => (
                    <div key={rx.id} className="rounded-lg border border-gray-100 p-3 text-sm">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-medium text-gray-900">Prescription</p>
                        <span className="text-xs text-gray-400">{new Date(rx.createdAt).toLocaleDateString()}</span>
                      </div>
                      {rx.notes && <p className="text-gray-500 mb-2 italic">{rx.notes}</p>}
                      <div className="space-y-1">
                        {rx.items.map((item: any) => (
                          <div key={item.id} className="flex gap-2 text-xs text-gray-600">
                            <Pill className="h-3.5 w-3.5 shrink-0 text-brand-400 mt-0.5" />
                            <span><strong>{item.medicineName}</strong>{item.dosage && ` · ${item.dosage}`}{item.frequency && ` · ${item.frequency}`}{item.duration && ` · ${item.duration}`}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        ) : null
      )}
    </div>
  )
}

// ─── Prescriptions Tab ────────────────────────────────────────────────────────

function PrescriptionsTab() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [selectedApptId, setSelectedApptId] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [rxNotes, setRxNotes] = useState('')
  const [items, setItems] = useState([{ medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }])

  const { data: apptData } = useQuery({
    queryKey: ['doctor-panel', 'appointments', 'all', 1],
    queryFn: () => doctorPanelApi.getAppointments('all', 1).then(r => r.data),
  })

  const { data: rxData, isLoading } = useQuery({
    queryKey: ['doctor-panel', 'prescriptions', page],
    queryFn: () => doctorPanelApi.getDoctorPrescriptions(page).then(r => r.data),
  })

  const issueMut = useMutation({
    mutationFn: (data: any) => doctorPanelApi.issuePrescription(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctor-panel', 'prescriptions'] })
      setShowForm(false)
      setItems([{ medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }])
      setRxNotes('')
      setSelectedApptId('')
      setSelectedPatientId('')
    },
  })

  const appointments: DoctorAppointment[] = (apptData as any)?.data ?? []
  const prescriptions: DoctorPrescription[] = (rxData as any)?.data ?? []
  const pages: number = (rxData as any)?.pages ?? 1

  const handleApptChange = (apptId: string) => {
    setSelectedApptId(apptId)
    const appt = appointments.find(a => a.id === apptId)
    if (appt) setSelectedPatientId(appt.patient.id)
  }

  const handleIssue = () => {
    if (!selectedPatientId) return
    const validItems = items.filter(i => i.medicineName.trim())
    if (!validItems.length) return
    issueMut.mutate({
      patientId: selectedPatientId,
      appointmentId: selectedApptId || undefined,
      notes: rxNotes || undefined,
      items: validItems,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">E-Prescriptions</h3>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
          <Plus className="h-4 w-4" /> Issue New
        </button>
      </div>

      {showForm && (
        <SectionCard title="New Prescription">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Appointment (optional)</label>
              <select value={selectedApptId} onChange={e => handleApptChange(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none">
                <option value="">— Select appointment —</option>
                {appointments.filter(a => a.status !== 'cancelled').map(a => (
                  <option key={a.id} value={a.id}>
                    {a.patient.name} · {a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString() : 'TBD'} · {a.status}
                  </option>
                ))}
              </select>
            </div>

            {!selectedApptId && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Patient (required if no appointment)</label>
                <select value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none">
                  <option value="">— Select patient —</option>
                  {Array.from(new Map(appointments.map(a => [a.patient.id, a.patient])).values()).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
              <textarea value={rxNotes} onChange={e => setRxNotes(e.target.value)} rows={2}
                placeholder="General instructions, allergies to avoid..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Medicines</label>
                <button onClick={() => setItems(i => [...i, { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }])}
                  className="flex items-center gap-1 text-xs font-medium text-brand-500 hover:text-brand-700">
                  <Plus className="h-3 w-3" /> Add Medicine
                </button>
              </div>
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <input value={item.medicineName} onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, medicineName: e.target.value } : it))}
                        placeholder="Medicine name *" className="flex-1 rounded border border-gray-200 px-2 py-1.5 text-sm focus:border-brand-400 focus:outline-none" />
                      {items.length > 1 && (
                        <button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {(['dosage', 'frequency', 'duration', 'instructions'] as const).map(field => (
                        <input key={field} value={item[field]} onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: e.target.value } : it))}
                          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                          className="rounded border border-gray-200 px-2 py-1.5 text-xs focus:border-brand-400 focus:outline-none" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={handleIssue} disabled={issueMut.isPending || !selectedPatientId || !items.some(i => i.medicineName.trim())}
                className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
                <Save className="h-4 w-4" /> {issueMut.isPending ? 'Saving...' : 'Issue Prescription'}
              </button>
              <button onClick={() => setShowForm(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600">Cancel</button>
            </div>
          </div>
        </SectionCard>
      )}

      {isLoading ? <Spinner /> : prescriptions.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">No prescriptions issued yet</p>
      ) : (
        <div className="space-y-3">
          {prescriptions.map(rx => (
            <div key={rx.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{rx.patient.name}</p>
                  <p className="text-xs text-gray-400">{rx.patient.email} · {new Date(rx.createdAt).toLocaleDateString()}</p>
                </div>
                <Pill className="h-5 w-5 text-brand-400" />
              </div>
              {rx.notes && <p className="mb-2 text-sm text-gray-500 italic">"{rx.notes}"</p>}
              <div className="space-y-1.5">
                {rx.items.map(item => (
                  <div key={item.id} className="flex flex-wrap gap-2 text-sm">
                    <span className="font-medium text-gray-800">{item.medicineName}</span>
                    {item.dosage && <span className="text-gray-500">· {item.dosage}</span>}
                    {item.frequency && <span className="text-gray-500">· {item.frequency}</span>}
                    {item.duration && <span className="text-gray-500">· {item.duration}</span>}
                    {item.instructions && <span className="text-xs text-gray-400 italic">({item.instructions})</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="rounded-lg border border-gray-200 p-1.5 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
          <span className="text-sm text-gray-600">{page} / {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            className="rounded-lg border border-gray-200 p-1.5 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  )
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────

function AnalyticsTab({ stats }: { stats: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Today" value={stats?.todayCount ?? 0} icon={Calendar} color="bg-blue-50 text-blue-600" />
        <StatCard label="This Week" value={stats?.weekCount ?? 0} icon={TrendingUp} color="bg-indigo-50 text-indigo-600" />
        <StatCard label="Total Earnings" value={`Rs ${(stats?.revenue ?? 0).toLocaleString()}`} icon={DollarSign} color="bg-green-50 text-green-600" />
        <StatCard label="Completed" value={stats?.completed ?? 0} icon={CheckCircle} color="bg-green-50 text-green-600" />
        <StatCard label="Cancelled" value={stats?.cancelled ?? 0} icon={XCircle} color="bg-red-50 text-red-600" />
        <StatCard label="Rating" value={`${(stats?.rating ?? 0).toFixed(1)} ★`} icon={Star} color="bg-yellow-50 text-yellow-600" sub={`${stats?.totalReviews ?? 0} reviews`} />
      </div>

      <SectionCard title="Completed Appointments with Payments">
        {!stats?.recentPayments?.length ? (
          <p className="py-4 text-center text-sm text-gray-400">No paid appointments yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                  <th className="pb-2 pr-4 font-medium">Patient</th>
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentPayments.map((p: any) => (
                  <tr key={p.id}>
                    <td className="py-2 pr-4 font-medium text-gray-900">{p.patient.name}</td>
                    <td className="py-2 pr-4 text-gray-500 capitalize">{p.consultationType ?? '—'}</td>
                    <td className="py-2 pr-4 text-gray-500">{p.appointmentDate ? new Date(p.appointmentDate).toLocaleDateString() : '—'}</td>
                    <td className="py-2 text-right font-semibold text-green-700">Rs {Number(p.paymentAmount ?? 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

// ─── Chat Tab ─────────────────────────────────────────────────────────────────

function ChatTab() {
  const qc = useQueryClient()
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['doctor-panel', 'messages'],
    queryFn: () => doctorPanelApi.getMessages().then(r => r.data),
    refetchInterval: 30000,
  })

  const sendMut = useMutation({
    mutationFn: ({ receiverId, msg }: { receiverId: string; msg: string }) =>
      doctorPanelApi.sendMessage(receiverId, msg),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctor-panel', 'messages'] })
      setMessage('')
    },
  })

  const conversations: any[] = (data as any)?.data ?? []
  const selectedConv = conversations.find(c => c.partner.id === selectedConvId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConv])

  return (
    <div className="flex h-[520px] gap-4 overflow-hidden">
      {/* Conversation list */}
      <div className="w-56 shrink-0 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3">
          <p className="text-sm font-semibold text-gray-900">Conversations</p>
          <button onClick={() => qc.invalidateQueries({ queryKey: ['doctor-panel', 'messages'] })}
            className="mt-0.5 flex items-center gap-1 text-xs text-gray-400 hover:text-brand-500">
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>
        {isLoading ? <Spinner /> : conversations.length === 0 ? (
          <p className="p-4 text-center text-xs text-gray-400">No conversations yet</p>
        ) : (
          conversations.map(conv => (
            <button key={conv.partner.id} onClick={() => setSelectedConvId(conv.partner.id)}
              className={`flex w-full items-center gap-3 border-b border-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${selectedConvId === conv.partner.id ? 'bg-brand-50' : ''}`}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-600">
                {conv.partner.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{conv.partner.name}</p>
                <p className="truncate text-xs text-gray-400">{conv.messages[conv.messages.length - 1]?.message ?? ''}</p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Chat window */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {!selectedConv ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <MessageSquare className="mx-auto h-10 w-10 text-gray-200" />
              <p className="mt-2 text-sm text-gray-400">Select a conversation</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-600">
                {selectedConv.partner.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{selectedConv.partner.name}</p>
                <p className="text-xs capitalize text-gray-400">{selectedConv.partner.role}</p>
              </div>
              <div className="ml-auto flex gap-2">
                <button className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:text-brand-500"><Phone className="h-4 w-4" /></button>
                <button className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:text-brand-500"><Video className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 p-4">
              {selectedConv.messages.map((m: any) => (
                <div key={m.id} className={`flex ${m.isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${m.isMine ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
                    {m.message}
                    <p className={`mt-0.5 text-right text-[10px] ${m.isMine ? 'text-brand-100' : 'text-gray-400'}`}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t border-gray-100 p-3">
              <div className="flex items-center gap-2">
                <input value={message} onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && message.trim()) { sendMut.mutate({ receiverId: selectedConv.partner.id, msg: message }); e.preventDefault() } }}
                  placeholder="Type a message..." className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-brand-400 focus:outline-none" />
                <button onClick={() => { if (message.trim()) sendMut.mutate({ receiverId: selectedConv.partner.id, msg: message }) }}
                  disabled={!message.trim() || sendMut.isPending}
                  className="rounded-xl bg-brand-500 p-2.5 text-white hover:bg-brand-600 disabled:opacity-50">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab({ profile, onSave }: { profile: DoctorPanelProfile; onSave: (d: any) => Promise<void> }) {
  const [form, setForm] = useState({
    name: profile.user.name ?? '',
    specialization: profile.doctor.specialization ?? '',
    qualification: profile.doctor.qualification ?? '',
    experience: profile.doctor.experience ?? 0,
    consultationFee: Number(profile.doctor.consultationFee ?? 0),
    city: profile.doctor.city ?? '',
    location: profile.doctor.location ?? '',
    about: profile.doctor.about ?? '',
    imageUrl: profile.doctor.imageUrl ?? '',
    consultationTypes: profile.doctor.consultationTypes ?? [],
    languages: profile.doctor.languages ?? [],
  })
  const [saving, setSaving] = useState(false)
  const [langInput, setLangInput] = useState('')
  const [success, setSuccess] = useState(false)

  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }))

  const toggleType = (t: string) => set('consultationTypes', form.consultationTypes.includes(t) ? form.consultationTypes.filter(x => x !== t) : [...form.consultationTypes, t])
  const addLang = (l: string) => { if (l && !form.languages.includes(l)) { set('languages', [...form.languages, l]); setLangInput('') } }
  const removeLang = (l: string) => set('languages', form.languages.filter(x => x !== l))

  const handleSave = async () => {
    setSaving(true)
    await onSave({ ...form, experience: Number(form.experience), consultationFee: Number(form.consultationFee) })
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="space-y-5">
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-700">
          <Check className="h-4 w-4" /> Profile saved successfully
        </div>
      )}

      {/* Profile image */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gray-100 border border-gray-200">
          {form.imageUrl ? <img src={form.imageUrl} alt="Profile" className="h-full w-full object-cover" /> : <User className="h-8 w-8 m-4 text-gray-300" />}
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-500">Profile Image URL</label>
          <input value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
            placeholder="https://..." />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { label: 'Full Name', key: 'name', type: 'text' },
          { label: 'Qualification', key: 'qualification', type: 'text' },
          { label: 'City', key: 'city', type: 'text' },
          { label: 'Clinic / Location', key: 'location', type: 'text' },
          { label: 'Experience (years)', key: 'experience', type: 'number' },
          { label: 'Consultation Fee (Rs)', key: 'consultationFee', type: 'number' },
        ].map(({ label, key, type }) => (
          <div key={key}>
            <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
            <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" />
          </div>
        ))}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Specialization</label>
        <select value={form.specialization} onChange={e => set('specialization', e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none">
          <option value="">— Select —</option>
          {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">About</label>
        <textarea rows={3} value={form.about} onChange={e => set('about', e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Consultation Types</label>
        <div className="flex gap-2 flex-wrap">
          {CONSULTATION_TYPES.map(t => (
            <button key={t} onClick={() => toggleType(t)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors capitalize ${form.consultationTypes.includes(t) ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-200 text-gray-600 hover:border-brand-300'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Languages</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {form.languages.map(l => (
            <span key={l} className="flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-sm text-brand-700">
              {l}<button onClick={() => removeLang(l)} className="hover:text-red-500"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <select value={langInput} onChange={e => setLangInput(e.target.value)}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none">
            <option value="">Add language...</option>
            {COMMON_LANGUAGES.filter(l => !form.languages.includes(l)).map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <button onClick={() => addLang(langInput)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:border-brand-300">Add</button>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
        <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  )
}

// ─── Availability Tab ─────────────────────────────────────────────────────────

function AvailabilityTab({ existingSlots, onSave }: { existingSlots: AvailabilitySlot[]; onSave: (slots: any[]) => Promise<void> }) {
  const [schedule, setSchedule] = useState<WeekSchedule>(() => initWeekSchedule(existingSlots))
  const [saving, setSaving] = useState(false)

  const toggleDay = (i: number) => setSchedule(prev => prev.map((d, idx) => idx === i ? { ...d, enabled: !d.enabled } : d))

  const updateSlot = (di: number, si: number, k: keyof DaySlot, v: string | number) =>
    setSchedule(prev => prev.map((d, i) => i === di ? { ...d, slots: d.slots.map((s, j) => j === si ? { ...s, [k]: v } : s) } : d))

  const addSlot = (di: number) =>
    setSchedule(prev => prev.map((d, i) => i === di ? { ...d, slots: [...d.slots, { startTime: '09:00', endTime: '17:00', slotDurationMin: 30 }] } : d))

  const removeSlot = (di: number, si: number) =>
    setSchedule(prev => prev.map((d, i) => i === di ? { ...d, slots: d.slots.filter((_, j) => j !== si) } : d))

  const handleSave = async () => {
    setSaving(true)
    const slots = schedule.flatMap((day, dayOfWeek) =>
      day.enabled ? day.slots.map(s => ({ dayOfWeek, ...s, isActive: true })) : []
    )
    await onSave(slots)
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      {DAYS.map((day, di) => (
        <div key={day} className={`rounded-xl border p-4 transition-colors ${schedule[di].enabled ? 'border-brand-200 bg-brand-50' : 'border-gray-100 bg-white'}`}>
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <div onClick={() => toggleDay(di)}
                className={`relative h-5 w-9 rounded-full transition-colors ${schedule[di].enabled ? 'bg-brand-500' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${schedule[di].enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm font-medium text-gray-800">{day}</span>
            </label>
            {schedule[di].enabled && (
              <button onClick={() => addSlot(di)} className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-700">
                <Plus className="h-3 w-3" /> Add slot
              </button>
            )}
          </div>
          {schedule[di].enabled && schedule[di].slots.map((slot, si) => (
            <div key={si} className="flex flex-wrap items-center gap-2 mb-2">
              <input type="time" value={slot.startTime} onChange={e => updateSlot(di, si, 'startTime', e.target.value)}
                className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-brand-400 focus:outline-none" />
              <span className="text-gray-400 text-sm">to</span>
              <input type="time" value={slot.endTime} onChange={e => updateSlot(di, si, 'endTime', e.target.value)}
                className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-brand-400 focus:outline-none" />
              <select value={slot.slotDurationMin} onChange={e => updateSlot(di, si, 'slotDurationMin', Number(e.target.value))}
                className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-brand-400 focus:outline-none">
                {SLOT_DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
              {schedule[di].slots.length > 1 && (
                <button onClick={() => removeSlot(di, si)} className="text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>
              )}
            </div>
          ))}
        </div>
      ))}
      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
        <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Schedule'}
      </button>
    </div>
  )
}

// ─── Certifications Tab ───────────────────────────────────────────────────────

function CertificationsTab({ certUrls, onAdd, onRemove }: { certUrls: string[]; onAdd: (name: string, url: string) => Promise<void>; onRemove: (idx: number) => Promise<void> }) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [adding, setAdding] = useState(false)

  const certs = certUrls.map(raw => {
    const sep = raw.indexOf('::')
    return sep === -1 ? { name: raw, url: '' } : { name: raw.slice(0, sep), url: raw.slice(sep + 2) }
  })

  const handleAdd = async () => {
    if (!name.trim() || !url.trim()) return
    setAdding(true)
    await onAdd(name.trim(), url.trim())
    setName(''); setUrl('')
    setAdding(false)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
        <p className="mb-3 text-sm font-medium text-gray-700">Add Certification</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Certificate name"
            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" />
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Document URL"
            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" />
          <button onClick={handleAdd} disabled={adding || !name.trim() || !url.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
            <Plus className="h-4 w-4" /> {adding ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>

      {certs.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">No certifications added yet</p>
      ) : (
        <div className="space-y-2">
          {certs.map((c, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div>
                <p className="font-medium text-gray-900">{c.name}</p>
                {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-500 hover:underline">View Document</a>}
              </div>
              <button onClick={() => onRemove(idx)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Home Visits Tab ──────────────────────────────────────────────────────────

function HomeVisitsTab({ homeVisits, homeVisitAreas, onSave }: { homeVisits: boolean; homeVisitAreas: string[]; onSave: (hv: boolean, areas: string[]) => Promise<void> }) {
  const [enabled, setEnabled] = useState(homeVisits)
  const [areas, setAreas] = useState<string[]>(homeVisitAreas ?? [])
  const [areaInput, setAreaInput] = useState('')
  const [saving, setSaving] = useState(false)

  const addArea = () => { if (areaInput.trim() && !areas.includes(areaInput.trim())) { setAreas(prev => [...prev, areaInput.trim()]); setAreaInput('') } }
  const removeArea = (a: string) => setAreas(prev => prev.filter(x => x !== a))

  const handleSave = async () => {
    setSaving(true)
    await onSave(enabled, areas)
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div>
          <p className="font-medium text-gray-900">Accept Home Visits</p>
          <p className="text-sm text-gray-400">Allow patients to book you for home visits</p>
        </div>
        <button onClick={() => setEnabled(v => !v)}
          className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? 'bg-brand-500' : 'bg-gray-200'}`}>
          <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      {enabled && (
        <div>
          <p className="mb-3 text-sm font-medium text-gray-700">Serviceable Areas</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {areas.map(a => (
              <span key={a} className="flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-sm text-brand-700">
                <MapPin className="h-3 w-3" />{a}
                <button onClick={() => removeArea(a)} className="hover:text-red-500"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={areaInput} onChange={e => setAreaInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addArea() }}
              placeholder="Enter area name, press Enter"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" />
            <button onClick={addArea} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:border-brand-300">Add</button>
          </div>
        </div>
      )}

      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
        <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function DoctorPanelPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { accessToken, user } = authStore((s: any) => ({ accessToken: s.accessToken, user: s.user }))
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [isOnline, setIsOnline] = useState(false)

  const handleLogout = () => {
    authStore.getState().clearAuth()
    navigate(ROUTES.login)
  }

  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!accessToken) navigate(ROUTES.login, { replace: true })
  }, [accessToken, navigate])

  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['doctor-panel', 'profile'],
    queryFn: () => doctorPanelApi.getProfile().then(r => r.data),
    enabled: !!accessToken,
    retry: false,
  })

  const { data: stats } = useQuery({
    queryKey: ['doctor-panel', 'stats'],
    queryFn: () => doctorPanelApi.getStats().then(r => r.data),
    enabled: !!accessToken && !!profile,
    retry: false,
  })

  useEffect(() => {
    if (profile?.doctor?.isOnline !== undefined) setIsOnline(profile.doctor.isOnline)
    if (stats?.isOnline !== undefined) setIsOnline(stats.isOnline)
  }, [profile, stats])

  const resetTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    inactivityTimer.current = setTimeout(async () => {
      if (isOnline) {
        await doctorPanelApi.setOnlineStatus(false)
        setIsOnline(false)
      }
    }, 5 * 60 * 1000)
  }, [isOnline])

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll']
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }))
    resetTimer()
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer))
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    }
  }, [resetTimer])

  const updateProfileMut = useMutation({
    mutationFn: (d: any) => doctorPanelApi.updateProfile(d),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['doctor-panel'] }),
  })

  const onlineStatusMut = useMutation({
    mutationFn: (v: boolean) => doctorPanelApi.setOnlineStatus(v),
    onSuccess: (_, v) => { setIsOnline(v); qc.invalidateQueries({ queryKey: ['doctor-panel'] }) },
  })

  const updateAvailMut = useMutation({
    mutationFn: (slots: any[]) => doctorPanelApi.updateAvailability(slots),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['doctor-panel'] }),
  })

  const addCertMut = useMutation({
    mutationFn: ({ name, url }: { name: string; url: string }) => doctorPanelApi.addCertification(name, url),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['doctor-panel'] }),
  })

  const removeCertMut = useMutation({
    mutationFn: (idx: number) => doctorPanelApi.removeCertification(idx),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['doctor-panel'] }),
  })

  const homeVisitsMut = useMutation({
    mutationFn: ({ hv, areas }: { hv: boolean; areas: string[] }) => doctorPanelApi.updateHomeVisits(hv, areas),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['doctor-panel'] }),
  })

  const userRole = (user as any)?.role
  if (accessToken && userRole && userRole !== 'doctor') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-6">
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100 max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <AlertCircle className="h-7 w-7 text-amber-600" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">Doctor Access Required</h2>
          <p className="text-sm text-gray-500 mb-5">Your account doesn't have the doctor role. Contact admin to activate it.</p>
          <button onClick={() => navigate(ROUTES.welcome)} className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">Go Home</button>
        </div>
      </div>
    )
  }

  if (profileLoading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>
  }

  if (profileError) {
    const is403 = (profileError as any)?.response?.status === 403
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-6">
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100 max-w-sm text-center">
          <h2 className="mb-2 text-xl font-bold text-gray-900">{is403 ? 'Not a Doctor Account' : 'Something went wrong'}</h2>
          <p className="mb-5 text-sm text-gray-500">{is403 ? 'Contact admin to set your role to "doctor".' : 'Could not load your doctor profile.'}</p>
          <button onClick={() => navigate(ROUTES.welcome)} className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">Go Home</button>
        </div>
      </div>
    )
  }

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview',       label: 'Overview',       icon: LayoutDashboard },
    { id: 'appointments',   label: 'Appointments',   icon: Calendar },
    { id: 'patients',       label: 'Patients',       icon: Users },
    { id: 'prescriptions',  label: 'Prescriptions',  icon: Pill },
    { id: 'analytics',      label: 'Analytics',      icon: TrendingUp },
    { id: 'chat',           label: 'Live Chat',      icon: MessageSquare },
    { id: 'profile',        label: 'Profile',        icon: Edit3 },
    { id: 'availability',   label: 'Availability',   icon: Clock },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'home-visits',    label: 'Home Visits',    icon: Home },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Pending approval banner */}
      {profile?.doctor && !profile.doctor.isVerified && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Your profile is pending admin approval</p>
              <p className="text-xs text-amber-600">Patients cannot find or book you yet. You will receive a notification once your profile is approved. You can still complete your profile in the meantime.</p>
            </div>
          </div>
        </div>
      )}

      {/* Panel header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Doctor Panel</h1>
            <p className="text-sm text-gray-500">{profile?.user?.name} · {profile?.doctor?.specialization ?? 'No specialization set'}</p>
          </div>
          <div className="flex items-center gap-3">
            {profile?.doctor?.isVerified && (
              <span className="hidden sm:flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 border border-blue-200">
                <Check className="h-3.5 w-3.5" /> Verified
              </span>
            )}
            <button onClick={() => onlineStatusMut.mutate(!isOnline)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${isOnline ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600'}`}>
              {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              {isOnline ? 'Online' : 'Offline'}
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:border-rose-300 hover:text-rose-600 transition-colors">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block w-52 shrink-0">
            <nav className="space-y-0.5 rounded-xl border border-gray-100 bg-white p-2 shadow-sm">
              {TABS.map(tab => {
                const Icon = tab.icon
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                    <Icon className="h-4 w-4 shrink-0" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Mobile tab bar */}
          <div className="lg:hidden">
            <div className="flex overflow-x-auto gap-1 rounded-xl border border-gray-100 bg-white p-1 shadow-sm">
              {TABS.map(tab => {
                const Icon = tab.icon
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex shrink-0 flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${activeTab === tab.id ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Icon className="h-4 w-4" />
                    <span className="hidden xs:block">{tab.label.slice(0, 5)}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className={`rounded-xl border border-gray-100 bg-white shadow-sm ${activeTab === 'chat' ? 'p-4' : 'p-5 sm:p-6'}`}>

              {activeTab === 'overview' && (
                <OverviewTab stats={stats} isOnline={isOnline} onToggleOnline={v => onlineStatusMut.mutate(v)} />
              )}
              {activeTab === 'appointments' && <AppointmentsTab />}
              {activeTab === 'patients' && <PatientsTab />}
              {activeTab === 'prescriptions' && <PrescriptionsTab />}
              {activeTab === 'analytics' && <AnalyticsTab stats={stats} />}
              {activeTab === 'chat' && <ChatTab />}

              {activeTab === 'profile' && profile && (
                <ProfileTab profile={profile} onSave={async d => { await updateProfileMut.mutateAsync(d) }} />
              )}
              {activeTab === 'availability' && profile && (
                <AvailabilityTab
                  existingSlots={profile.doctor.availabilitySlots}
                  onSave={async slots => { await updateAvailMut.mutateAsync(slots) }}
                />
              )}
              {activeTab === 'certifications' && profile && (
                <CertificationsTab
                  certUrls={profile.doctor.certificationUrls}
                  onAdd={async (name, url) => { await addCertMut.mutateAsync({ name, url }) }}
                  onRemove={async idx => { await removeCertMut.mutateAsync(idx) }}
                />
              )}
              {activeTab === 'home-visits' && profile && (
                <HomeVisitsTab
                  homeVisits={profile.doctor.homeVisits}
                  homeVisitAreas={profile.doctor.homeVisitAreas}
                  onSave={async (hv, areas) => { await homeVisitsMut.mutateAsync({ hv, areas }) }}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
