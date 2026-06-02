import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FlaskConical, LayoutDashboard, BookOpen, Package, Settings,
  Plus, Pencil, Trash2, Loader2, X, Check, AlertCircle,
  Home, Building2, User, Upload,
  ChevronDown, CheckCircle2, AlertTriangle, LogOut,
} from 'lucide-react'
import { Navbar } from '../../../components/layouts/Navbar'
import { labCoordinatorApi, type LabTest, type LabPackage, type LabBooking, type LabCenter } from '../../../lib/api'
import { authStore } from '../../auth/store/authStore'
import { ROUTES } from '../../../constants/routes'

type Tab = 'overview' | 'bookings' | 'tests' | 'packages' | 'center'

const STATUS_COLORS: Record<string, string> = {
  scheduled:        'bg-blue-50 text-blue-700',
  confirmed:        'bg-indigo-50 text-indigo-700',
  sample_collected: 'bg-yellow-50 text-yellow-700',
  processing:       'bg-orange-50 text-orange-700',
  report_ready:     'bg-green-50 text-green-700',
  completed:        'bg-gray-50 text-gray-600',
  cancelled:        'bg-red-50 text-red-600',
}

const STATUSES = ['scheduled', 'confirmed', 'sample_collected', 'processing', 'report_ready', 'completed', 'cancelled']
const WORKING_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab() {
  const { data } = useQuery({
    queryKey: ['lab-coord-stats'],
    queryFn: () => labCoordinatorApi.getStats(),
    refetchInterval: 30000,
  })
  const stats = (data?.data as any)?.data
  const cards = [
    { label: 'Total Bookings', value: stats?.total ?? 0, color: 'brand' },
    { label: 'Today', value: stats?.todayCount ?? 0, color: 'blue' },
    { label: 'Pending / Confirmed', value: stats?.pending ?? 0, color: 'amber' },
    { label: 'Home Collection', value: stats?.homeCollection ?? 0, color: 'purple' },
    { label: 'Processing', value: stats?.processing ?? 0, color: 'orange' },
    { label: 'Reports Ready', value: stats?.reportReady ?? 0, color: 'green' },
  ]
  const colorMap: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
    green: 'bg-green-50 text-green-700',
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(c => (
        <div key={c.label} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">{c.label}</p>
          <p className={`mt-2 text-3xl font-black ${colorMap[c.color]?.split(' ')[1] ?? 'text-gray-900'}`}>{c.value}</p>
        </div>
      ))}
    </div>
  )
}

// ── Bookings Tab ─────────────────────────────────────────────────────────────
function BookingsTab() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [collectionFilter, setCollectionFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [assignModal, setAssignModal] = useState<LabBooking | null>(null)
  const [reportModal, setReportModal] = useState<LabBooking | null>(null)
  const [assignForm, setAssignForm] = useState({ name: '', phone: '' })
  const [reportForm, setReportForm] = useState({ url: '', note: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['lab-coord-bookings', statusFilter, collectionFilter, dateFilter, page],
    queryFn: () => labCoordinatorApi.getBookings({ status: statusFilter || undefined, collectionType: collectionFilter || undefined, date: dateFilter || undefined, page }),
    refetchInterval: 15000,
  })
  const bookings: LabBooking[] = (data?.data as any)?.data ?? []
  const totalPages: number = (data?.data as any)?.pages ?? 1
  const newBookingCount = bookings.filter(b => b.status === 'scheduled').length

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => labCoordinatorApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lab-coord-bookings'] }),
  })

  const assignMutation = useMutation({
    mutationFn: () => labCoordinatorApi.assignPhlebotomist(assignModal!.id, assignForm.name, assignForm.phone),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lab-coord-bookings'] }); setAssignModal(null); setAssignForm({ name: '', phone: '' }) },
  })

  const reportMutation = useMutation({
    mutationFn: () => labCoordinatorApi.uploadReport(reportModal!.id, reportForm.url, reportForm.note),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lab-coord-bookings'] }); setReportModal(null); setReportForm({ url: '', note: '' }) },
  })

  return (
    <div className="space-y-4">
      {/* New bookings banner */}
      {!statusFilter && newBookingCount > 0 && (
        <button
          onClick={() => setStatusFilter('scheduled')}
          className="flex w-full items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left hover:bg-amber-100 transition-colors"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500">
            <AlertCircle className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              {newBookingCount} new lab {newBookingCount === 1 ? 'booking' : 'bookings'} awaiting acceptance
            </p>
            <p className="text-xs text-amber-600">Click to review and accept or reject</p>
          </div>
          <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white">{newBookingCount}</span>
        </button>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select
          value={collectionFilter}
          onChange={e => { setCollectionFilter(e.target.value); setPage(1) }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
        >
          <option value="">All Types</option>
          <option value="home">Home Collection</option>
          <option value="lab">Lab Visit</option>
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={e => { setDateFilter(e.target.value); setPage(1) }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
        />
        {(statusFilter || collectionFilter || dateFilter) && (
          <button onClick={() => { setStatusFilter(''); setCollectionFilter(''); setDateFilter(''); setPage(1) }} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50">
            Clear
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-gray-400">
          <FlaskConical className="h-12 w-12 mb-3" />
          <p className="font-medium">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <div key={b.id} className={`rounded-2xl border bg-white overflow-hidden ${b.status === 'scheduled' ? 'border-amber-300' : 'border-gray-200'}`}>
              {/* Row */}
              <div
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 ${b.status === 'scheduled' ? 'bg-amber-50' : ''}`}
                onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${b.collectionType === 'home' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                  {b.collectionType === 'home' ? <Home className="h-4 w-4 text-purple-600" /> : <Building2 className="h-4 w-4 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {b.test?.name ?? b.package?.name ?? 'Booking'}
                  </p>
                  <p className="text-xs text-gray-500">{b.patient?.name} · {new Date(b.scheduledAt).toLocaleDateString()} {new Date(b.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[b.status] ?? 'bg-gray-50 text-gray-600'}`}>
                  {b.status.replace('_', ' ')}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${expandedId === b.id ? 'rotate-180' : ''}`} />
              </div>

              {/* Expanded */}
              {expandedId === b.id && (
                <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold">Patient</p>
                      <p className="font-medium text-gray-800">{b.patient?.name}</p>
                      <p className="text-xs text-gray-500">{b.patient?.email}</p>
                      {b.patient?.phone && <p className="text-xs text-gray-500">{b.patient.phone}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold">Booking</p>
                      <p className="font-medium text-gray-800">PKR {Number(b.amount).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{b.collectionType === 'home' ? 'Home Collection' : 'Lab Visit'}</p>
                    </div>
                    {b.address && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-400 font-semibold">Address</p>
                        <p className="text-sm text-gray-700">{b.address}</p>
                      </div>
                    )}
                    {b.phlebotomistName && (
                      <div>
                        <p className="text-xs text-gray-400 font-semibold">Phlebotomist</p>
                        <p className="font-medium text-gray-800">{b.phlebotomistName}</p>
                        <p className="text-xs text-gray-500">{b.phlebotomistPhone}</p>
                      </div>
                    )}
                    {b.reportUrl && (
                      <div>
                        <p className="text-xs text-gray-400 font-semibold">Report</p>
                        <a href={b.reportUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-600 underline font-medium">View Report PDF</a>
                        {b.reportNote && <p className="text-xs text-gray-500 mt-0.5">{b.reportNote}</p>}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                    {/* Accept / Reject for new bookings */}
                    {b.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => statusMutation.mutate({ id: b.id, status: 'confirmed' })}
                          disabled={statusMutation.isPending}
                          className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" /> Accept
                        </button>
                        <button
                          onClick={() => statusMutation.mutate({ id: b.id, status: 'cancelled' })}
                          disabled={statusMutation.isPending}
                          className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" /> Reject
                        </button>
                        <div className="w-px bg-gray-200 self-stretch mx-1" />
                      </>
                    )}
                    {/* Status update dropdown */}
                    <select
                      value={b.status}
                      onChange={e => statusMutation.mutate({ id: b.id, status: e.target.value })}
                      className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium focus:outline-none"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>

                    {/* Assign phlebotomist (home only) */}
                    {b.collectionType === 'home' && (
                      <button
                        onClick={() => { setAssignModal(b); setAssignForm({ name: b.phlebotomistName ?? '', phone: b.phlebotomistPhone ?? '' }) }}
                        className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100"
                      >
                        <User className="h-3.5 w-3.5" /> {b.phlebotomistName ? 'Update Phlebotomist' : 'Assign Phlebotomist'}
                      </button>
                    )}

                    {/* Upload report */}
                    <button
                      onClick={() => { setReportModal(b); setReportForm({ url: b.reportUrl ?? '', note: b.reportNote ?? '' }) }}
                      className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100"
                    >
                      <Upload className="h-3.5 w-3.5" /> {b.reportUrl ? 'Update Report' : 'Upload Report'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40">Prev</button>
          <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40">Next</button>
        </div>
      )}

      {/* Assign Phlebotomist Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Assign Phlebotomist</h3>
              <button onClick={() => setAssignModal(null)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
                <input value={assignForm.name} onChange={e => setAssignForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400" placeholder="Phlebotomist name" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                <input value={assignForm.phone} onChange={e => setAssignForm(f => ({ ...f, phone: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400" placeholder="+92-300-..." />
              </div>
            </div>
            <button
              onClick={() => assignMutation.mutate()}
              disabled={!assignForm.name || !assignForm.phone || assignMutation.isPending}
              className="mt-4 w-full rounded-lg bg-purple-600 py-2.5 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {assignMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Assign
            </button>
          </div>
        </div>
      )}

      {/* Upload Report Modal */}
      {reportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Upload Report</h3>
              <button onClick={() => setReportModal(null)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Report URL (PDF link)</label>
                <input value={reportForm.url} onChange={e => setReportForm(f => ({ ...f, url: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Report Note (optional)</label>
                <textarea value={reportForm.note} onChange={e => setReportForm(f => ({ ...f, note: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 resize-none" placeholder="Any notes about the report..." />
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">Patient will be notified automatically when report is uploaded.</p>
              </div>
            </div>
            <button
              onClick={() => reportMutation.mutate()}
              disabled={!reportForm.url || reportMutation.isPending}
              className="mt-4 w-full rounded-lg bg-green-600 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {reportMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload &amp; Notify Patient
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Tests Tab ─────────────────────────────────────────────────────────────────
function TestsTab() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<LabTest | null>(null)
  const [form, setForm] = useState({ name: '', description: '', category: '', price: '', discountPct: '0', turnaround: '', homeCollection: true, requiresFasting: false, sampleType: '', preparation: '' })

  const { data: testsData, isLoading } = useQuery({
    queryKey: ['lab-coord-tests'],
    queryFn: () => labCoordinatorApi.getTests(),
  })
  const tests: LabTest[] = (testsData?.data as any) ?? []

  const createMutation = useMutation({
    mutationFn: () => labCoordinatorApi.createTest({ ...form, discountPct: Number(form.discountPct) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lab-coord-tests'] }); setShowForm(false); resetForm() },
  })

  const updateMutation = useMutation({
    mutationFn: () => labCoordinatorApi.updateTest(editing!.id, { ...form, price: Number(form.price) as any, discountPct: Number(form.discountPct) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lab-coord-tests'] }); setEditing(null); resetForm() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => labCoordinatorApi.deleteTest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lab-coord-tests'] }),
  })

  const resetForm = () => setForm({ name: '', description: '', category: '', price: '', discountPct: '0', turnaround: '', homeCollection: true, requiresFasting: false, sampleType: '', preparation: '' })

  const openEdit = (t: LabTest) => {
    setEditing(t)
    setForm({ name: t.name, description: t.description ?? '', category: t.category ?? '', price: String(Number(t.price)), discountPct: String(t.discountPct), turnaround: t.turnaround ?? '', homeCollection: t.homeCollection, requiresFasting: t.requiresFasting, sampleType: t.sampleType ?? '', preparation: t.preparation ?? '' })
    setShowForm(true)
  }

  const handleSubmit = () => { editing ? updateMutation.mutate() : createMutation.mutate() }
  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => { setEditing(null); resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" /> Add Test
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">{editing ? 'Edit Test' : 'New Test'}</h3>
            <button onClick={() => { setShowForm(false); setEditing(null); resetForm() }}><X className="h-5 w-5 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['name', 'Test Name'], ['category', 'Category'], ['sampleType', 'Sample Type'], ['turnaround', 'Turnaround']].map(([k, label]) => (
              <div key={k}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                <input value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-400" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Price (PKR)</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Discount %</label>
              <input type="number" min="0" max="100" value={form.discountPct} onChange={e => setForm(f => ({ ...f, discountPct: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-400" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-400 resize-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Preparation Instructions</label>
              <textarea value={form.preparation} onChange={e => setForm(f => ({ ...f, preparation: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-400 resize-none" />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.homeCollection} onChange={e => setForm(f => ({ ...f, homeCollection: e.target.checked }))} className="rounded" />
                Home Collection
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.requiresFasting} onChange={e => setForm(f => ({ ...f, requiresFasting: e.target.checked }))} className="rounded" />
                Requires Fasting
              </label>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!form.name || !form.price || isPending}
            className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {editing ? 'Save Changes' : 'Create Test'}
          </button>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Test Name', 'Category', 'Sample', 'Price', 'Discount', 'Turnaround', 'Status', ''].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tests.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                  <td className="px-4 py-3 text-gray-500">{t.category ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{t.sampleType ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold">PKR {Number(t.price).toLocaleString()}</td>
                  <td className="px-4 py-3 text-green-600">{t.discountPct}%</td>
                  <td className="px-4 py-3 text-gray-500">{t.turnaround ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${t.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                      {t.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(t)} className="text-gray-400 hover:text-brand-500"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => deleteMutation.mutate(t.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tests.length === 0 && (
            <div className="flex flex-col items-center py-12 text-gray-400">
              <FlaskConical className="h-10 w-10 mb-2" />
              <p>No tests yet. Add your first test.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Packages Tab ──────────────────────────────────────────────────────────────
function PackagesTab() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<LabPackage | null>(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', discountPct: '0', testIds: [] as string[] })

  const { data: pkgData, isLoading } = useQuery({
    queryKey: ['lab-coord-packages'],
    queryFn: () => labCoordinatorApi.getPackages(),
  })
  const { data: testsData } = useQuery({
    queryKey: ['lab-coord-tests'],
    queryFn: () => labCoordinatorApi.getTests(),
  })
  const packages: LabPackage[] = (pkgData?.data as any) ?? []
  const allTests: LabTest[] = (testsData?.data as any) ?? []

  const createMutation = useMutation({
    mutationFn: () => labCoordinatorApi.createPackage({ ...form, price: Number(form.price), discountPct: Number(form.discountPct) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lab-coord-packages'] }); setShowForm(false); resetForm() },
  })

  const updateMutation = useMutation({
    mutationFn: () => labCoordinatorApi.updatePackage(editing!.id, { ...form, price: Number(form.price), discountPct: Number(form.discountPct) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lab-coord-packages'] }); setEditing(null); setShowForm(false); resetForm() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => labCoordinatorApi.deletePackage(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lab-coord-packages'] }),
  })

  const resetForm = () => setForm({ name: '', description: '', price: '', discountPct: '0', testIds: [] })

  const openEdit = (p: LabPackage) => {
    setEditing(p)
    setForm({ name: p.name, description: p.description ?? '', price: String(Number(p.price)), discountPct: String(p.discountPct), testIds: p.items.map(i => i.testId) })
    setShowForm(true)
  }

  const toggleTest = (id: string) => setForm(f => ({
    ...f,
    testIds: f.testIds.includes(id) ? f.testIds.filter(t => t !== id) : [...f.testIds, id],
  }))

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setEditing(null); resetForm(); setShowForm(true) }} className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
          <Plus className="h-4 w-4" /> New Package
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">{editing ? 'Edit Package' : 'New Package'}</h3>
            <button onClick={() => { setShowForm(false); setEditing(null); resetForm() }}><X className="h-5 w-5 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Package Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Price (PKR)</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Discount %</label>
              <input type="number" min="0" max="100" value={form.discountPct} onChange={e => setForm(f => ({ ...f, discountPct: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-400" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-400 resize-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-2">Include Tests</label>
              <div className="flex flex-wrap gap-2">
                {allTests.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTest(t.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${form.testIds.includes(t.id) ? 'border-brand-500 bg-brand-500 text-white' : 'border-gray-200 text-gray-600 hover:border-brand-400'}`}
                  >
                    {form.testIds.includes(t.id) && <Check className="inline h-3 w-3 mr-1" />}
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => editing ? updateMutation.mutate() : createMutation.mutate()}
            disabled={!form.name || !form.price || form.testIds.length === 0 || createMutation.isPending || updateMutation.isPending}
            className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {editing ? 'Save Changes' : 'Create Package'}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {packages.map(p => (
            <div key={p.id} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900">{p.name}</p>
                  {p.description && <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-brand-500"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => deleteMutation.mutate(p.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-bold text-brand-600">PKR {Number(p.price).toLocaleString()}</span>
                {p.discountPct > 0 && <span className="rounded bg-green-50 px-2 py-0.5 text-xs font-bold text-green-600">{p.discountPct}% OFF</span>}
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.items.map(i => (
                  <span key={i.testId} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{i.test.name}</span>
                ))}
              </div>
            </div>
          ))}
          {packages.length === 0 && (
            <div className="col-span-2 flex flex-col items-center py-12 text-gray-400">
              <Package className="h-10 w-10 mb-2" />
              <p>No packages yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Center Settings Tab ───────────────────────────────────────────────────────
function CenterTab() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['lab-coord-center'],
    queryFn: () => labCoordinatorApi.getCenter(),
  })
  const center: LabCenter | null = (data?.data as any)?.data ?? null

  const [form, setForm] = useState({
    name: '', address: '', city: '', phone: '', email: '',
    openTime: '08:00', closeTime: '18:00',
    workingDays: [] as string[],
    homeCollection: true,
    collectionZones: '',
  })

  // Populate form when center loads
  const [initialized, setInitialized] = useState(false)
  if (center && !initialized) {
    setForm({
      name: center.name,
      address: center.address,
      city: center.city ?? '',
      phone: center.phone ?? '',
      email: center.email ?? '',
      openTime: center.openTime,
      closeTime: center.closeTime,
      workingDays: center.workingDays,
      homeCollection: center.homeCollection,
      collectionZones: center.collectionZones.join(', '),
    })
    setInitialized(true)
  }

  const updateMutation = useMutation({
    mutationFn: () => labCoordinatorApi.upsertCenter({
      ...form,
      collectionZones: form.collectionZones.split(',').map(z => z.trim()).filter(Boolean),
    } as any),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lab-coord-center'] }); setInitialized(false) },
  })

  const toggleDay = (day: string) => setForm(f => ({
    ...f,
    workingDays: f.workingDays.includes(day) ? f.workingDays.filter(d => d !== day) : [...f.workingDays, day],
  }))

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5 max-w-2xl">
      <h3 className="font-bold text-gray-900">Lab Center Settings</h3>
      <div className="grid grid-cols-2 gap-4">
        {[['name', 'Center Name'], ['address', 'Address'], ['city', 'City'], ['phone', 'Phone'], ['email', 'Email']].map(([k, label]) => (
          <div key={k} className={k === 'address' ? 'col-span-2' : ''}>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
            <input value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400" />
          </div>
        ))}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Opening Time</label>
          <input type="time" value={form.openTime} onChange={e => setForm(f => ({ ...f, openTime: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Closing Time</label>
          <input type="time" value={form.closeTime} onChange={e => setForm(f => ({ ...f, closeTime: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-2">Working Days</label>
          <div className="flex gap-2 flex-wrap">
            {WORKING_DAYS.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${form.workingDays.includes(day) ? 'border-brand-500 bg-brand-500 text-white' : 'border-gray-200 text-gray-600 hover:border-brand-400'}`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Home Collection Zones (comma-separated areas)</label>
          <input value={form.collectionZones} onChange={e => setForm(f => ({ ...f, collectionZones: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400" placeholder="e.g. Gulshan, DHA, Clifton" />
        </div>
        <div className="col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.homeCollection} onChange={e => setForm(f => ({ ...f, homeCollection: e.target.checked }))} className="rounded" />
            <span className="text-sm font-medium text-gray-700">Offer Home Sample Collection</span>
          </label>
        </div>
      </div>
      <button
        onClick={() => updateMutation.mutate()}
        disabled={!form.name || !form.address || updateMutation.isPending}
        className="w-full rounded-xl bg-brand-500 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        Save Settings
      </button>
      {updateMutation.isSuccess && (
        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4" /> Saved successfully
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function LabCoordinatorPage() {
  const navigate = useNavigate()
  const { user, accessToken, clearAuth } = authStore((s: any) => ({ user: s.user, accessToken: s.accessToken, clearAuth: s.clearAuth }))
  const [tab, setTab] = useState<Tab>('overview')

  if (!accessToken) {
    navigate(ROUTES.login)
    return null
  }

  if (user?.role && user.role !== 'lab_coordinator') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-lg font-semibold text-gray-700">Lab Coordinator access required</p>
        <button onClick={() => navigate(ROUTES.dashboard)} className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-semibold text-white">Go to Dashboard</button>
      </div>
    )
  }

  const handleLogout = () => { clearAuth(); navigate(ROUTES.login) }

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview',  label: 'Overview',  icon: LayoutDashboard },
    { id: 'bookings',  label: 'Bookings',  icon: BookOpen },
    { id: 'tests',     label: 'Tests',     icon: FlaskConical },
    { id: 'packages',  label: 'Packages',  icon: Package },
    { id: 'center',    label: 'Center',    icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
              <FlaskConical className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lab Coordinator Panel</h1>
              <p className="text-sm text-gray-500">Manage tests, bookings, and reports</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">LAB COORD</span>
            <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-500 hover:border-red-200">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-2xl border border-gray-200 bg-white p-1.5 overflow-x-auto">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${tab === t.id ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        {tab === 'overview'  && <OverviewTab />}
        {tab === 'bookings'  && <BookingsTab />}
        {tab === 'tests'     && <TestsTab />}
        {tab === 'packages'  && <PackagesTab />}
        {tab === 'center'    && <CenterTab />}
      </div>
    </div>
  )
}
