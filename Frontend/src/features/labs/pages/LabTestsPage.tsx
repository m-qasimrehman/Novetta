import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  FlaskConical, Search, Home, Building2, Clock, X, Package,
  BookOpen, ChevronRight, AlertCircle, CheckCircle2, Loader2,
  FileText, Phone,
} from 'lucide-react'
import { Navbar } from '../../../components/layouts/Navbar'
import { Footer } from '../../../components/layouts/Footer'
import { labsApi, type LabTest, type LabPackage, type LabBooking } from '../../../lib/api'
import { authStore } from '../../auth/store/authStore'
import { ROUTES } from '../../../constants/routes'
import { useToast } from '../../../hooks/useToast'

const CATEGORIES = ['All', 'Hematology', 'Endocrinology', 'Cardiology', 'Diabetes', 'Gastroenterology', 'Nephrology', 'Nutrition', 'Infectious Disease']

const STATUS_COLORS: Record<string, string> = {
  scheduled:        'bg-blue-50 text-blue-700',
  confirmed:        'bg-indigo-50 text-indigo-700',
  sample_collected: 'bg-yellow-50 text-yellow-700',
  processing:       'bg-orange-50 text-orange-700',
  report_ready:     'bg-green-50 text-green-700',
  completed:        'bg-gray-100 text-gray-600',
  cancelled:        'bg-red-50 text-red-600',
}

type PageTab = 'tests' | 'packages' | 'bookings'

// ── Booking Modal ────────────────────────────────────────────────────────────
function BookingModal({
  item, type, onClose,
}: {
  item: LabTest | LabPackage
  type: 'test' | 'package'
  onClose: () => void
}) {
  const toast = useToast()
  const qc = useQueryClient()
  const [form, setForm] = useState({ collectionType: 'home', scheduledAt: '', address: '' })

  const price = type === 'test'
    ? Math.round(Number((item as LabTest).price) * (1 - (item as LabTest).discountPct / 100))
    : Math.round(Number((item as LabPackage).price) * (1 - (item as LabPackage).discountPct / 100))

  const bookMutation = useMutation({
    mutationFn: () => labsApi.book({
      ...(type === 'test' ? { testId: item.id } : { packageId: item.id }),
      collectionType: form.collectionType,
      scheduledAt: form.scheduledAt,
      address: form.address || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-lab-bookings'] })
      toast.pushToast({ title: 'Booked!', description: 'Your booking has been scheduled.', variant: 'success' })
      onClose()
    },
    onError: (e: any) => {
      toast.pushToast({ title: 'Booking failed', description: e?.response?.data?.message ?? 'Please try again.', variant: 'error' })
    },
  })

  const handleSubmit = () => {
    if (!form.scheduledAt) { toast.pushToast({ title: 'Select date & time', variant: 'error' }); return }
    if (form.collectionType === 'home' && !form.address) { toast.pushToast({ title: 'Enter address', variant: 'error' }); return }
    bookMutation.mutate()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">Book {type === 'test' ? 'Test' : 'Package'}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400" /></button>
        </div>
        <div className="rounded-lg bg-blue-50 p-3 mb-4">
          <p className="font-semibold text-sm text-gray-800">{item.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">PKR {price.toLocaleString()} · {type === 'test' ? (item as LabTest).turnaround ?? '' : `${(item as LabPackage).items.length} tests`}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Collection Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[{ v: 'home', label: 'Home Collection', Icon: Home }, { v: 'lab', label: 'Visit Lab', Icon: Building2 }].map(({ v, label, Icon }) => (
                <button
                  key={v}
                  onClick={() => setForm(f => ({ ...f, collectionType: v }))}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors ${form.collectionType === v ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-600'}`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Preferred Date &amp; Time</label>
            <input
              type="datetime-local"
              min={new Date().toISOString().slice(0, 16)}
              value={form.scheduledAt}
              onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400"
            />
          </div>
          {form.collectionType === 'home' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Collection Address</label>
              <textarea
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                rows={2}
                placeholder="Enter full address for home collection..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 resize-none"
              />
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={bookMutation.isPending}
          className="mt-5 w-full rounded-lg bg-brand-500 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {bookMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {bookMutation.isPending ? 'Booking…' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  )
}

// ── Tests Tab ────────────────────────────────────────────────────────────────
function TestsTab({ onBook }: { onBook: (item: LabTest, type: 'test') => void }) {
  const navigate = useNavigate()
  const accessToken = authStore((s: any) => s.accessToken)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const { data: tests = [], isLoading } = useQuery<LabTest[]>({
    queryKey: ['lab-tests'],
    queryFn: () => labsApi.listTests().then(r => r.data),
  })

  const filtered = tests.filter(t => {
    const matchCat = activeCategory === 'All' || t.category === activeCategory
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || (t.category?.toLowerCase().includes(search.toLowerCase()) ?? false)
    return matchCat && matchSearch && t.isActive
  })

  const handleBook = (t: LabTest) => {
    if (!accessToken) { navigate(ROUTES.login); return }
    onBook(t, 'test')
  }

  return (
    <div>
      {/* Search + Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-400"
            placeholder="Search tests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${activeCategory === c ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 h-48" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(test => {
            const discounted = Math.round(Number(test.price) * (1 - test.discountPct / 100))
            return (
              <div key={test.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                    <FlaskConical className="h-5 w-5 text-blue-500" />
                  </div>
                  {test.discountPct > 0 && <span className="rounded bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">{test.discountPct}% OFF</span>}
                </div>
                <h3 className="font-semibold text-gray-800 leading-snug text-sm">{test.name}</h3>
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">{test.description}</p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                  {test.turnaround && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{test.turnaround}</span>}
                  {test.homeCollection && <span className="flex items-center gap-1"><Home className="h-3 w-3" />Home</span>}
                  {test.requiresFasting && <span className="text-amber-600 font-medium">Fasting required</span>}
                  {test.sampleType && <span>{test.sampleType}</span>}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-gray-900">PKR {discounted.toLocaleString()}</span>
                    {test.discountPct > 0 && <span className="ml-1.5 text-xs text-gray-400 line-through">PKR {Number(test.price).toLocaleString()}</span>}
                  </div>
                  <button onClick={() => handleBook(test)} className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-600">
                    Book Now
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {filtered.length === 0 && !isLoading && (
        <div className="flex flex-col items-center py-16 text-gray-400">
          <FlaskConical className="h-12 w-12 mb-3" />
          <p className="font-medium">No tests found</p>
        </div>
      )}
    </div>
  )
}

// ── Packages Tab ─────────────────────────────────────────────────────────────
function PackagesTab({ onBook }: { onBook: (item: LabPackage, type: 'package') => void }) {
  const navigate = useNavigate()
  const accessToken = authStore((s: any) => s.accessToken)

  const { data: packages = [], isLoading } = useQuery<LabPackage[]>({
    queryKey: ['lab-packages'],
    queryFn: () => labsApi.listPackages().then(r => r.data),
  })

  const handleBook = (p: LabPackage) => {
    if (!accessToken) { navigate(ROUTES.login); return }
    onBook(p, 'package')
  }

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>

  if (packages.filter(p => p.isActive).length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-gray-400">
        <Package className="h-12 w-12 mb-3" />
        <p className="font-medium">No packages available yet</p>
      </div>
    )
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {packages.filter(p => p.isActive).map(pkg => {
        const discounted = Math.round(Number(pkg.price) * (1 - pkg.discountPct / 100))
        return (
          <div key={pkg.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
                <Package className="h-5 w-5 text-purple-500" />
              </div>
              {pkg.discountPct > 0 && <span className="rounded bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">{pkg.discountPct}% OFF</span>}
            </div>
            <h3 className="font-bold text-gray-800 text-sm">{pkg.name}</h3>
            {pkg.description && <p className="mt-1 text-xs text-gray-500 line-clamp-2">{pkg.description}</p>}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {pkg.items.map(i => (
                <span key={i.testId} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{i.test.name}</span>
              ))}
            </div>
            {pkg.labCenter && (
              <p className="mt-2 text-xs text-gray-400">{pkg.labCenter.name}{pkg.labCenter.city ? `, ${pkg.labCenter.city}` : ''}</p>
            )}
            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-gray-900">PKR {discounted.toLocaleString()}</span>
                {pkg.discountPct > 0 && <span className="ml-1.5 text-xs text-gray-400 line-through">PKR {Number(pkg.price).toLocaleString()}</span>}
              </div>
              <button onClick={() => handleBook(pkg)} className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-600">
                Book Now
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── My Bookings Tab ───────────────────────────────────────────────────────────
function MyBookingsTab() {
  const qc = useQueryClient()
  const toast = useToast()

  const { data: bookings = [], isLoading } = useQuery<LabBooking[]>({
    queryKey: ['my-lab-bookings'],
    queryFn: () => labsApi.myBookings().then(r => r.data),
    refetchInterval: 15000,
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => labsApi.cancelBooking(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-lab-bookings'] })
      toast.pushToast({ title: 'Booking cancelled', variant: 'success' })
    },
  })

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-gray-400">
        <BookOpen className="h-12 w-12 mb-3" />
        <p className="font-medium">No bookings yet</p>
        <p className="text-sm mt-1">Book a lab test or package above</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map(b => (
        <div key={b.id} className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-start gap-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${b.collectionType === 'home' ? 'bg-purple-100' : 'bg-blue-100'}`}>
              {b.collectionType === 'home' ? <Home className="h-5 w-5 text-purple-600" /> : <Building2 className="h-5 w-5 text-blue-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-gray-900 text-sm">{b.test?.name ?? b.package?.name ?? 'Booking'}</p>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[b.status] ?? 'bg-gray-50 text-gray-600'}`}>
                  {b.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {b.collectionType === 'home' ? 'Home Collection' : 'Lab Visit'} ·{' '}
                {new Date(b.scheduledAt).toLocaleDateString()} at {new Date(b.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              {b.labCenter && <p className="text-xs text-gray-400 mt-0.5">{b.labCenter.name}</p>}

              {/* Phlebotomist assigned */}
              {b.phlebotomistName && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2">
                  <Phone className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                  <p className="text-xs text-purple-700 font-medium">
                    {b.phlebotomistName} will collect your sample · {b.phlebotomistPhone}
                  </p>
                </div>
              )}

              {/* Report ready */}
              {b.reportUrl && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  <a href={b.reportUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-green-700 underline flex items-center gap-1">
                    <FileText className="h-3 w-3" /> View Report
                  </a>
                  {b.reportNote && <span className="text-xs text-green-600">— {b.reportNote}</span>}
                </div>
              )}

              {/* Package tests */}
              {b.package && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {b.package.items.map(i => (
                    <span key={i.testId} className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">{i.test.name}</span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <p className="font-bold text-brand-600 text-sm">PKR {Number(b.amount).toLocaleString()}</p>
                {b.status === 'scheduled' && (
                  <button
                    onClick={() => cancelMutation.mutate(b.id)}
                    disabled={cancelMutation.isPending}
                    className="text-xs font-semibold text-red-500 hover:text-red-600 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function LabTestsPage() {
  const [tab, setTab] = useState<PageTab>('tests')
  const [bookingItem, setBookingItem] = useState<{ item: LabTest | LabPackage; type: 'test' | 'package' } | null>(null)
  const accessToken = authStore((s: any) => s.accessToken)

  const openBook = (item: LabTest | LabPackage, type: 'test' | 'package') => setBookingItem({ item, type })

  const PAGE_TABS: { id: PageTab; label: string; icon: React.ElementType; protected?: boolean }[] = [
    { id: 'tests',    label: 'Lab Tests',  icon: FlaskConical },
    { id: 'packages', label: 'Packages',   icon: Package },
    { id: 'bookings', label: 'My Bookings', icon: BookOpen, protected: true },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="brand-gradient text-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black">Book Lab Tests at Home</h1>
              <p className="mt-2 text-white/80">Trusted labs · Accurate reports · Home collection available</p>
              <div className="mt-4 flex gap-4 text-sm">
                {[['50%', 'Off on all tests'], ['24h', 'Report delivery'], ['Home', 'Sample collection']].map(([v, l]) => (
                  <div key={l} className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5">
                    <span className="font-bold">{v}</span>
                    <span className="text-white/80">{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/15 rounded-xl p-4">
              <FlaskConical className="h-8 w-8" />
              <div>
                <p className="font-bold text-lg">Packages Available</p>
                <p className="text-white/80 text-sm">Bundle &amp; save more</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Tab switcher */}
        <div className="mb-6 flex gap-1 rounded-2xl border border-gray-200 bg-white p-1.5 w-fit">
          {PAGE_TABS.filter(t => !t.protected || accessToken).map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${tab === t.id ? 'bg-brand-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            )
          })}
          {!accessToken && (
            <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-400">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Sign in to see bookings</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          )}
        </div>

        {tab === 'tests'    && <TestsTab onBook={openBook} />}
        {tab === 'packages' && <PackagesTab onBook={openBook} />}
        {tab === 'bookings' && <MyBookingsTab />}
      </div>

      <Footer />

      {/* Booking Modal */}
      {bookingItem && (
        <BookingModal
          item={bookingItem.item}
          type={bookingItem.type}
          onClose={() => setBookingItem(null)}
        />
      )}
    </div>
  )
}
