import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users, Stethoscope, Calendar, Package, FlaskConical, BarChart3, Tag,
  ShieldCheck, TrendingUp, CheckCircle, XCircle, Plus, Trash2, Edit2,
  Activity, X, Crown, CreditCard, Wifi, WifiOff, Award, Search,
  ChevronLeft, ChevronRight, DollarSign, Settings, Filter, LogOut, Building2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../../../components/layouts/Navbar'
import { Footer } from '../../../components/layouts/Footer'
import { adminApi, type Coupon, type MembershipPlan } from '../../../lib/api'
import { authStore } from '../../auth/store/authStore'
import { ROUTES } from '../../../constants/routes'

type Tab = 'overview' | 'users' | 'doctors' | 'plans' | 'coupons' | 'appointments' | 'orders' | 'payouts' | 'pharmacies' | 'labs' | 'system'

// ─── Shared UI ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, sub }: { label: string; value: string | number; icon: any; color: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function SectionCard({ title, icon: Icon, children, action }: { title: string; icon: any; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-brand-500" />
          <h3 className="font-bold text-gray-900">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${color}`}>{label}</span>
}

function Spinner() {
  return <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" /></div>
}

function EmptyRow({ cols, msg }: { cols: number; msg: string }) {
  return <tr><td colSpan={cols} className="px-4 py-10 text-center text-sm text-gray-400">{msg}</td></tr>
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ isAdmin }: { isAdmin: boolean }) {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')

  const { data: statsRes, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ['admin-stats', dateFrom, dateTo],
    queryFn: () => adminApi.getStats({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }).then(r => r.data),
    enabled: isAdmin,
  })
  const { data: activityRes } = useQuery({
    queryKey: ['admin-activity'],
    queryFn: () => adminApi.getActivity().then(r => r.data),
    enabled: isAdmin,
  })
  const { data: revenueRes } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: () => adminApi.getRevenue().then(r => r.data),
    enabled: isAdmin,
  })

  const stats    = (statsRes as any)?.data
  const activity = (activityRes as any)?.data
  const revenue  = (revenueRes as any)?.data

  return (
    <div className="space-y-6">
      {/* Date filter */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">From</label>
          <input type="date" className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">To</label>
          <input type="date" className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <button onClick={() => refetch()} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
          <Filter className="inline h-3.5 w-3.5 mr-1" />Apply
        </button>
        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(''); setDateTo('') }} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50">Clear</button>
        )}
      </div>

      {/* Stats grid */}
      {statsLoading ? <Spinner /> : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          <StatCard label="Total Users"     value={stats?.users ?? 0}        icon={Users}        color="bg-blue-50 text-blue-600" />
          <StatCard label="Doctors"         value={stats?.doctors ?? 0}      icon={Stethoscope}  color="bg-green-50 text-green-600" />
          <StatCard label="Appointments"    value={stats?.appointments ?? 0} icon={Calendar}     color="bg-purple-50 text-purple-600" />
          <StatCard label="Pharmacy Orders" value={stats?.orders ?? 0}       icon={Package}      color="bg-amber-50 text-amber-600" />
          <StatCard label="Lab Bookings"    value={stats?.labBookings ?? 0}  icon={FlaskConical} color="bg-pink-50 text-pink-600" />
          <StatCard label="Active Members"  value={stats?.memberships ?? 0}  icon={Crown}        color="bg-indigo-50 text-indigo-600" />
          <StatCard label="Coupon Uses"     value={stats?.couponUsage ?? 0}  icon={Tag}          color="bg-rose-50 text-rose-600" />
        </div>
      )}

      {/* Revenue cards */}
      {revenue && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Pharmacy Revenue', value: `PKR ${Number(revenue.pharmacy ?? 0).toLocaleString()}`, color: 'text-brand-600' },
            { label: 'Lab Revenue',      value: `PKR ${Number(revenue.labs ?? 0).toLocaleString()}`,    color: 'text-green-600' },
            { label: 'Membership Est.',  value: `PKR ${Number(revenue.memberships ?? 0).toLocaleString()}`, color: 'text-indigo-600' },
            { label: 'Total Revenue',    value: `PKR ${Number(revenue.total ?? 0).toLocaleString()}`,   color: 'text-gray-900' },
          ].map(item => (
            <div key={item.label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
              <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Monthly bar chart */}
      {revenue?.monthlyChart?.length > 0 && (
        <SectionCard title="Monthly Revenue" icon={TrendingUp}>
          <div className="space-y-2 p-5">
            {revenue.monthlyChart.map((row: any) => {
              const max = Math.max(...revenue.monthlyChart.map((r: any) => r.amount), 1)
              return (
                <div key={row.month} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-xs text-gray-500">{row.month}</span>
                  <div className="flex-1 overflow-hidden rounded-full bg-gray-100 h-2.5">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${(row.amount / max) * 100}%` }} />
                  </div>
                  <span className="w-28 shrink-0 text-right text-xs font-semibold text-gray-700">PKR {Number(row.amount).toLocaleString()}</span>
                </div>
              )
            })}
          </div>
        </SectionCard>
      )}

      {/* Recent activity */}
      {activity && (
        <div className="grid gap-5 sm:grid-cols-2">
          <SectionCard title="Recent Sign-ups" icon={Activity}>
            <div className="divide-y divide-gray-50">
              {activity.recentUsers?.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-xs font-bold">{u.name?.slice(0, 2).toUpperCase()}</div>
                    <div><p className="text-sm font-semibold text-gray-900">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></div>
                  </div>
                  <div className="text-right">
                    <Badge label={u.role} color={u.role === 'doctor' ? 'bg-green-50 text-green-700' : u.role === 'admin' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'} />
                    <p className="mt-1 text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Recent Orders" icon={Package}>
            <div className="divide-y divide-gray-50">
              {activity.recentOrders?.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between px-5 py-3">
                  <div><p className="text-sm font-semibold text-gray-900">{o.patient?.name}</p><p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</p></div>
                  <p className="text-sm font-bold text-brand-600">PKR {Number(o.totalAmount).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  )
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab({ isAdmin }: { isAdmin: boolean }) {
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)

  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-users', q, role, page],
    queryFn: () => adminApi.listUsers(page, role || undefined, q || undefined).then(r => r.data),
    enabled: isAdmin,
  })
  const toggleMut = useMutation({ mutationFn: (id: string) => adminApi.toggleUser(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }) })

  const users: any[] = (res as any)?.data ?? []
  const pages: number = (res as any)?.pages ?? 1

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-brand-400 focus:outline-none" placeholder="Search name or email…" value={q} onChange={e => { setQ(e.target.value); setPage(1) }} />
        </div>
        <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" value={role} onChange={e => { setRole(e.target.value); setPage(1) }}>
          <option value="">All Roles</option>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <SectionCard title={`Users (${(res as any)?.total ?? 0})`} icon={Users}>
        {isLoading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr>{['Name', 'Email', 'Phone', 'Role', 'Verified', 'Status', 'Joined', 'Action'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-600">{u.name?.slice(0, 2).toUpperCase()}</div><span className="text-sm font-medium text-gray-900">{u.name}</span></div></td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[160px] truncate">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{u.phone ?? '—'}</td>
                    <td className="px-4 py-3"><Badge label={u.role} color={u.role === 'admin' ? 'bg-red-50 text-red-600' : u.role === 'doctor' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'} /></td>
                    <td className="px-4 py-3">{u.isVerified ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-gray-300" />}</td>
                    <td className="px-4 py-3"><Badge label={u.isActive ? 'Active' : 'Suspended'} color={u.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} /></td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><button onClick={() => toggleMut.mutate(u.id)} className={`rounded-lg border px-3 py-1 text-xs font-semibold ${u.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>{u.isActive ? 'Suspend' : 'Activate'}</button></td>
                  </tr>
                ))}
                {users.length === 0 && <EmptyRow cols={8} msg="No users found" />}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="flex items-center gap-1 text-sm text-gray-500 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Prev</button>
            <span className="text-sm text-gray-500">Page {page} of {pages}</span>
            <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="flex items-center gap-1 text-sm text-gray-500 disabled:opacity-40">Next <ChevronRight className="h-4 w-4" /></button>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

// ─── Doctors Tab ──────────────────────────────────────────────────────────────

function DoctorsTab({ isAdmin }: { isAdmin: boolean }) {
  const qc = useQueryClient()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-doctors'],
    queryFn: () => adminApi.listDoctors().then(r => r.data),
    enabled: isAdmin,
  })
  const verifyMut = useMutation({ mutationFn: (id: string) => adminApi.verifyDoctor(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-doctors'] }) })

  const doctors: any[] = (res as any)?.data ?? []

  const parseCert = (entry: string) => {
    const sep = entry.indexOf('::')
    return sep >= 0 ? { name: entry.slice(0, sep), url: entry.slice(sep + 2) } : { name: entry, url: entry }
  }

  return (
    <SectionCard title={`Doctors (${doctors.length})`} icon={Stethoscope}>
      {isLoading ? <Spinner /> : (
        <div className="divide-y divide-gray-50">
          {doctors.map(d => (
            <div key={d.id}>
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 text-sm font-bold">{d.user?.name?.slice(0, 2).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm">{d.user?.name}</p>
                    {d.isVerified && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {d.isOnline ? <span className="flex items-center gap-1 text-xs text-green-600"><Wifi className="h-3 w-3" /> Online</span> : <span className="text-xs text-gray-400"><WifiOff className="h-3 w-3 inline" /> Offline</span>}
                  </div>
                  <p className="text-xs text-gray-500">{d.specialization ?? 'N/A'} · {d.city ?? '—'} · {d.experience}y exp · PKR {Number(d.consultationFee ?? 0).toLocaleString()}/session</p>
                  <p className="text-xs text-gray-400">{d.user?.email}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Badge label={d.isVerified ? 'Verified' : 'Pending'} color={d.isVerified ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'} />
                  {d.certificationUrls?.length > 0 && (
                    <button onClick={() => setExpandedId(expandedId === d.id ? null : d.id)} className="flex items-center gap-1 rounded-lg border border-indigo-200 px-2.5 py-1 text-xs text-indigo-600 hover:bg-indigo-50">
                      <Award className="h-3 w-3" /> {d.certificationUrls.length} cert{d.certificationUrls.length > 1 ? 's' : ''}
                    </button>
                  )}
                  <button onClick={() => verifyMut.mutate(d.id)} disabled={verifyMut.isPending} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${d.isVerified ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                    {d.isVerified ? 'Unverify' : 'Verify'}
                  </button>
                </div>
              </div>
              {/* Certifications expandable */}
              {expandedId === d.id && d.certificationUrls?.length > 0 && (
                <div className="border-t border-dashed border-gray-100 bg-indigo-50/40 px-5 py-3">
                  <p className="mb-2 text-xs font-semibold text-indigo-700">Certifications</p>
                  <div className="space-y-1.5">
                    {d.certificationUrls.map((entry: string, i: number) => {
                      const { name, url } = parseCert(entry)
                      return (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Award className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                          <span className="text-gray-800">{name}</span>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-brand-500 hover:underline">View →</a>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
          {doctors.length === 0 && <div className="py-12 text-center text-sm text-gray-400">No doctors registered yet</div>}
        </div>
      )}
    </SectionCard>
  )
}

// ─── Membership Plans Tab ─────────────────────────────────────────────────────

const BLANK_PLAN = { name: '', description: '', price: '', durationDays: '30', discountPct: '10', features: '', freeDelivery: false, maxAnnualSavings: '', isActive: true }

function PlansTab({ isAdmin }: { isAdmin: boolean }) {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<MembershipPlan | null>(null)
  const [form, setForm] = useState(BLANK_PLAN)
  const [showMembStats, setShowMembStats] = useState(false)

  const { data: plansRes, isLoading } = useQuery({ queryKey: ['admin-plans'], queryFn: () => adminApi.listPlans().then(r => r.data), enabled: isAdmin })
  const { data: membStatsRes } = useQuery({ queryKey: ['admin-membership-stats'], queryFn: () => adminApi.getMembershipStats().then(r => r.data), enabled: isAdmin && showMembStats })

  const plans: MembershipPlan[] = (plansRes as any)?.data ?? []
  const membStats = (membStatsRes as any)?.data

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  const openCreate = () => { setEditing(null); setForm(BLANK_PLAN); setShowForm(true) }
  const openEdit   = (p: MembershipPlan) => {
    setEditing(p)
    setForm({ name: p.name, description: p.description ?? '', price: String(p.price), durationDays: String(p.durationDays), discountPct: String(p.discountPct), features: p.features.join('\n'), freeDelivery: p.freeDelivery, maxAnnualSavings: String(p.maxAnnualSavings ?? ''), isActive: p.isActive })
    setShowForm(true)
  }

  const createMut = useMutation({
    mutationFn: () => adminApi.createPlan({ name: form.name, description: form.description || undefined, price: Number(form.price), durationDays: Number(form.durationDays), discountPct: Number(form.discountPct), features: form.features.split('\n').filter(Boolean), freeDelivery: form.freeDelivery, maxAnnualSavings: form.maxAnnualSavings ? Number(form.maxAnnualSavings) : undefined, isActive: form.isActive }),
    onSuccess: () => { setShowForm(false); qc.invalidateQueries({ queryKey: ['admin-plans'] }) },
  })
  const updateMut = useMutation({
    mutationFn: () => adminApi.updatePlan(editing!.id, { name: form.name, description: form.description || undefined, price: Number(form.price), durationDays: Number(form.durationDays), discountPct: Number(form.discountPct), features: form.features.split('\n').filter(Boolean), freeDelivery: form.freeDelivery, maxAnnualSavings: form.maxAnnualSavings ? Number(form.maxAnnualSavings) : undefined, isActive: form.isActive }),
    onSuccess: () => { setShowForm(false); qc.invalidateQueries({ queryKey: ['admin-plans'] }) },
  })
  const deleteMut = useMutation({ mutationFn: (id: string) => adminApi.deletePlan(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-plans'] }) })
  const toggleActiveMut = useMutation({ mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminApi.updatePlan(id, { isActive }), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-plans'] }) })

  return (
    <div className="space-y-5">
      {/* Membership analytics */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <button onClick={() => setShowMembStats(v => !v)} className="flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700">
          <BarChart3 className="h-4 w-4" /> {showMembStats ? 'Hide' : 'Show'} Membership Analytics
        </button>
        {showMembStats && membStats && (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Active Members" value={membStats.active} icon={Crown} color="bg-indigo-50 text-indigo-600" />
            <StatCard label="Total Sign-ups" value={membStats.total}  icon={Users}  color="bg-blue-50 text-blue-600" />
            <StatCard label="Churn Rate"     value={`${membStats.churnRate}%`} icon={TrendingUp} color="bg-amber-50 text-amber-600" />
            {membStats.plans?.map((p: any) => (
              <StatCard key={p.id} label={p.name} value={`${p.subscribers} members`} icon={Crown} color="bg-purple-50 text-purple-600" sub={`PKR ${p.price}/period`} />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{plans.length} plans</p>
        <button onClick={openCreate} className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"><Plus className="h-4 w-4" /> New Plan</button>
      </div>

      {/* Plan form */}
      {showForm && (
        <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">{editing ? 'Edit Plan' : 'Create Plan'}</h3>
            <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="col-span-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none" placeholder="Plan Name (e.g. Gold Monthly)" value={form.name} onChange={e => set('name', e.target.value)} />
            <input className="col-span-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none" placeholder="Description" value={form.description} onChange={e => set('description', e.target.value)} />
            <div><label className="mb-1 block text-xs text-gray-600">Price (PKR)</label><input type="number" className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" placeholder="299" value={form.price} onChange={e => set('price', e.target.value)} /></div>
            <div><label className="mb-1 block text-xs text-gray-600">Duration (days)</label><input type="number" className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" placeholder="30" value={form.durationDays} onChange={e => set('durationDays', e.target.value)} /></div>
            <div><label className="mb-1 block text-xs text-gray-600">Discount %</label><input type="number" min="0" max="100" className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" placeholder="10" value={form.discountPct} onChange={e => set('discountPct', e.target.value)} /></div>
            <div><label className="mb-1 block text-xs text-gray-600">Max Annual Savings (PKR)</label><input type="number" className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" placeholder="Optional" value={form.maxAnnualSavings} onChange={e => set('maxAnnualSavings', e.target.value)} /></div>
            <div className="col-span-2"><label className="mb-1 block text-xs text-gray-600">Features (one per line)</label><textarea rows={4} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" placeholder="Free delivery on all orders&#10;10% off medicines&#10;Priority booking" value={form.features} onChange={e => set('features', e.target.value)} /></div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" checked={form.freeDelivery} onChange={e => set('freeDelivery', e.target.checked)} className="h-4 w-4 accent-brand-500" /> Free Delivery Included</label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="h-4 w-4 accent-brand-500" /> Active (visible to users)</label>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={() => editing ? updateMut.mutate() : createMut.mutate()} disabled={!form.name || !form.price || createMut.isPending || updateMut.isPending} className="flex-1 rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
              {(createMut.isPending || updateMut.isPending) ? 'Saving…' : editing ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </div>
      )}

      {isLoading ? <Spinner /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map(plan => (
            <div key={plan.id} className={`rounded-xl border p-5 ${plan.isActive ? 'border-gray-100 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'} shadow-sm`}>
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-900">{plan.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => openEdit(plan)} className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:border-brand-400 hover:text-brand-500"><Edit2 className="h-3.5 w-3.5" /></button>
                  <button onClick={() => deleteMut.mutate(plan.id)} className="rounded-lg border border-red-100 p-1.5 text-red-400 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <p className="text-2xl font-black text-brand-600">PKR {Number(plan.price).toLocaleString()}</p>
              <p className="text-xs text-gray-400">{plan.durationDays} days · {plan.discountPct}% off</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {plan.freeDelivery && <Badge label="Free Delivery" color="bg-green-50 text-green-600" />}
                {plan.maxAnnualSavings && <Badge label={`Max PKR ${Number(plan.maxAnnualSavings).toLocaleString()} savings`} color="bg-indigo-50 text-indigo-600" />}
                <Badge label={`${plan._count?.subscriptions ?? 0} subscribers`} color="bg-gray-100 text-gray-500" />
              </div>
              <ul className="mt-3 space-y-1">
                {plan.features.slice(0, 3).map((f, i) => <li key={i} className="flex items-center gap-1.5 text-xs text-gray-600"><CheckCircle className="h-3 w-3 text-green-500 shrink-0" />{f}</li>)}
                {plan.features.length > 3 && <li className="text-xs text-gray-400">+{plan.features.length - 3} more features</li>}
              </ul>
              <button onClick={() => toggleActiveMut.mutate({ id: plan.id, isActive: !plan.isActive })} className={`mt-4 w-full rounded-lg border py-1.5 text-xs font-semibold ${plan.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                {plan.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
          {plans.length === 0 && <div className="col-span-3 rounded-xl border border-dashed border-gray-200 py-12 text-center text-gray-400">No plans yet. Create your first plan.</div>}
        </div>
      )}
    </div>
  )
}

// ─── Coupons Tab ──────────────────────────────────────────────────────────────

function CouponsTab({ isAdmin }: { isAdmin: boolean }) {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [couponForm, setCouponForm] = useState({ code: '', description: '', discountType: 'percentage', discountValue: '', minAmount: '', maxUses: '', expiresAt: '' })

  const { data: res, isLoading } = useQuery({ queryKey: ['admin-coupons'], queryFn: () => adminApi.listCoupons().then(r => r.data), enabled: isAdmin })
  const coupons: Coupon[] = (res as any)?.data ?? []

  const createMut = useMutation({
    mutationFn: () => adminApi.createCoupon({ code: couponForm.code, description: couponForm.description || undefined, discountType: couponForm.discountType, discountValue: Number(couponForm.discountValue), minAmount: couponForm.minAmount ? Number(couponForm.minAmount) : undefined, maxUses: couponForm.maxUses ? Number(couponForm.maxUses) : undefined, expiresAt: couponForm.expiresAt || undefined }),
    onSuccess: () => { setShowForm(false); setCouponForm({ code: '', description: '', discountType: 'percentage', discountValue: '', minAmount: '', maxUses: '', expiresAt: '' }); qc.invalidateQueries({ queryKey: ['admin-coupons'] }) },
  })
  const toggleMut  = useMutation({ mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminApi.updateCoupon(id, { isActive }), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }) })
  const deleteMut  = useMutation({ mutationFn: (id: string) => adminApi.deleteCoupon(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }) })

  const cf = couponForm; const set = (k: string, v: any) => setCouponForm(p => ({ ...p, [k]: v }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{coupons.length} coupons · {coupons.reduce((s, c) => s + c.usedCount, 0)} total uses</p>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"><Plus className="h-4 w-4" /> Create Coupon</button>
      </div>
      {showForm && (
        <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-5 space-y-3">
          <div className="flex items-center justify-between"><h3 className="font-semibold text-gray-900">New Coupon</h3><button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-gray-400" /></button></div>
          <div className="grid grid-cols-2 gap-3">
            <input className="col-span-2 sm:col-span-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-mono uppercase focus:border-brand-400 focus:outline-none" placeholder="CODE" value={cf.code} onChange={e => set('code', e.target.value.toUpperCase())} />
            <select className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none" value={cf.discountType} onChange={e => set('discountType', e.target.value)}><option value="percentage">Percentage %</option><option value="fixed">Fixed Amount</option></select>
            <input type="number" className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none" placeholder={cf.discountType === 'percentage' ? 'Discount %' : 'Amount (PKR)'} value={cf.discountValue} onChange={e => set('discountValue', e.target.value)} />
            <input type="number" className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none" placeholder="Min order amount" value={cf.minAmount} onChange={e => set('minAmount', e.target.value)} />
            <input type="number" className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none" placeholder="Max uses (blank = unlimited)" value={cf.maxUses} onChange={e => set('maxUses', e.target.value)} />
            <input type="date" className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none" value={cf.expiresAt} onChange={e => set('expiresAt', e.target.value)} />
            <input className="col-span-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none" placeholder="Description (optional)" value={cf.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-600">Cancel</button>
            <button onClick={() => createMut.mutate()} disabled={!cf.code || !cf.discountValue || createMut.isPending} className="flex-1 rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white disabled:opacity-40">{createMut.isPending ? 'Creating…' : 'Create'}</button>
          </div>
        </div>
      )}
      <SectionCard title="All Coupons" icon={Tag}>
        {isLoading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr>{['Code', 'Discount', 'Min Amount', 'Uses', 'Expires', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map(c => (
                  <tr key={c.id} className={`hover:bg-gray-50 ${!c.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3"><span className="rounded-lg bg-gray-100 px-2.5 py-1 font-mono text-sm font-bold">{c.code}</span></td>
                    <td className="px-4 py-3 text-sm font-semibold text-brand-600">{c.discountType === 'percentage' ? `${c.discountValue}%` : `PKR ${c.discountValue}`}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{c.minAmount ? `PKR ${c.minAmount}` : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}</td>
                    <td className="px-4 py-3"><Badge label={c.isActive ? 'Active' : 'Off'} color={c.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'} /></td>
                    <td className="px-4 py-3"><div className="flex gap-2">
                      <button onClick={() => toggleMut.mutate({ id: c.id, isActive: !c.isActive })} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-50" title={c.isActive ? 'Disable' : 'Enable'}><Edit2 className="h-3 w-3" /></button>
                      <button onClick={() => deleteMut.mutate(c.id)} className="rounded-lg border border-red-200 px-2.5 py-1 text-xs text-red-500 hover:bg-red-50"><Trash2 className="h-3 w-3" /></button>
                    </div></td>
                  </tr>
                ))}
                {coupons.length === 0 && <EmptyRow cols={7} msg="No coupons yet. Create your first one above." />}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

// ─── Appointments Tab ─────────────────────────────────────────────────────────

function AppointmentsTab({ isAdmin }: { isAdmin: boolean }) {
  const [status, setStatus] = useState('')
  const [page, setPage]     = useState(1)

  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-appointments', status, page],
    queryFn: () => adminApi.listAllAppointments(status || undefined, page).then(r => r.data),
    enabled: isAdmin,
  })
  const apts: any[]   = (res as any)?.data ?? []
  const pages: number = (res as any)?.pages ?? 1
  const total: number = (res as any)?.total ?? 0

  const STATUS_COLORS: Record<string, string> = { pending: 'bg-amber-50 text-amber-700', confirmed: 'bg-blue-50 text-blue-700', completed: 'bg-green-50 text-green-700', cancelled: 'bg-red-50 text-red-700' }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All Statuses</option>
          {['pending', 'confirmed', 'completed', 'cancelled'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>
      <SectionCard title={`Appointments (${total})`} icon={Calendar}>
        {isLoading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr>{['Patient', 'Doctor', 'Date', 'Type', 'Status', 'Payment'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {apts.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><p className="text-sm font-medium text-gray-900">{a.patient?.name}</p><p className="text-xs text-gray-400">{a.patient?.email}</p></td>
                    <td className="px-4 py-3"><p className="text-sm font-medium text-gray-900">{a.doctor?.user?.name}</p><p className="text-xs text-gray-400">{a.doctor?.specialization}</p></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 capitalize">{a.consultationType ?? '—'}</td>
                    <td className="px-4 py-3"><Badge label={a.status} color={STATUS_COLORS[a.status] ?? 'bg-gray-100 text-gray-600'} /></td>
                    <td className="px-4 py-3"><Badge label={a.paymentStatus} color={a.paymentStatus === 'paid' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'} /></td>
                  </tr>
                ))}
                {apts.length === 0 && <EmptyRow cols={6} msg="No appointments found" />}
              </tbody>
            </table>
          </div>
        )}
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="flex items-center gap-1 text-sm text-gray-500 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Prev</button>
            <span className="text-sm text-gray-500">Page {page} of {pages}</span>
            <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="flex items-center gap-1 text-sm text-gray-500 disabled:opacity-40">Next <ChevronRight className="h-4 w-4" /></button>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab({ isAdmin }: { isAdmin: boolean }) {
  const [type, setType] = useState<'pharmacy' | 'lab'>('pharmacy')
  const [page, setPage] = useState(1)

  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-orders', type, page],
    queryFn: () => adminApi.listAllOrders(type, page).then(r => r.data),
    enabled: isAdmin,
  })
  const orders: any[]  = (res as any)?.data ?? []
  const total: number  = (res as any)?.total ?? 0
  const STATUS_COLORS: Record<string, string> = { pending: 'bg-amber-50 text-amber-700', processing: 'bg-blue-50 text-blue-700', delivered: 'bg-green-50 text-green-700', cancelled: 'bg-red-50 text-red-700', scheduled: 'bg-indigo-50 text-indigo-700', completed: 'bg-green-50 text-green-700' }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['pharmacy', 'lab'] as const).map(t => (
          <button key={t} onClick={() => { setType(t); setPage(1) }} className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${type === t ? 'bg-brand-500 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{t === 'pharmacy' ? 'Pharmacy Orders' : 'Lab Bookings'}</button>
        ))}
      </div>
      <SectionCard title={`${type === 'pharmacy' ? 'Pharmacy Orders' : 'Lab Bookings'} (${total})`} icon={Package}>
        {isLoading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>{type === 'pharmacy'
                  ? ['Patient', 'Items', 'Amount', 'Status', 'Date'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>)
                  : ['Patient', 'Test', 'Amount', 'Status', 'Scheduled'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>)
                }</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><p className="text-sm font-medium text-gray-900">{o.patient?.name}</p><p className="text-xs text-gray-400">{o.patient?.email}</p></td>
                    {type === 'pharmacy'
                      ? <td className="px-4 py-3 text-xs text-gray-500">{o.items?.map((i: any) => i.medicine?.name).filter(Boolean).join(', ') || '—'}</td>
                      : <td className="px-4 py-3 text-sm text-gray-700">{o.test?.name}</td>}
                    <td className="px-4 py-3 text-sm font-semibold text-brand-600">PKR {Number(o.totalAmount ?? o.amount ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge label={o.status} color={STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-600'} /></td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(o.createdAt ?? o.scheduledAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {orders.length === 0 && <EmptyRow cols={5} msg="No orders found" />}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

// ─── Payouts Tab ──────────────────────────────────────────────────────────────

function PayoutsTab({ isAdmin }: { isAdmin: boolean }) {
  const { data: res, isLoading } = useQuery({ queryKey: ['admin-payouts'], queryFn: () => adminApi.getPayouts().then(r => r.data), enabled: isAdmin })
  const doctors: any[] = (res as any)?.data?.doctors ?? []
  const total = doctors.reduce((s: number, d: any) => s + d.totalEarnings, 0)
  const pending = doctors.reduce((s: number, d: any) => s + d.pendingPayout, 0)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Total Paid Out"    value={`PKR ${total.toLocaleString()}`}   icon={DollarSign} color="bg-green-50 text-green-600" />
        <StatCard label="Pending This Week" value={`PKR ${pending.toLocaleString()}`} icon={CreditCard}  color="bg-amber-50 text-amber-600" />
        <StatCard label="Active Doctors"    value={doctors.length}                    icon={Stethoscope} color="bg-blue-50 text-blue-600" />
      </div>
      <SectionCard title="Doctor Earnings" icon={DollarSign}>
        {isLoading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr>{['Doctor', 'Specialization', 'Appointments', 'Total Earned', 'Pending (7d)', 'Action'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {doctors.map((d: any) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><p className="text-sm font-medium text-gray-900">{d.name}</p><p className="text-xs text-gray-400">{d.email}</p></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{d.specialization ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{d.appointmentCount}</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">PKR {d.totalEarnings.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-amber-600">PKR {d.pendingPayout.toLocaleString()}</td>
                    <td className="px-4 py-3"><button className="rounded-lg border border-green-200 px-3 py-1 text-xs font-semibold text-green-600 hover:bg-green-50">Process Payout</button></td>
                  </tr>
                ))}
                {doctors.length === 0 && <EmptyRow cols={6} msg="No payout data yet" />}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

// ─── System Tab ───────────────────────────────────────────────────────────────

function SystemTab({ isAdmin }: { isAdmin: boolean }) {
  const { data: onlineRes } = useQuery({ queryKey: ['admin-online'], queryFn: () => adminApi.getOnlineUsers().then(r => r.data), enabled: isAdmin, refetchInterval: 30000 })
  const onlineDoctors: any[] = (onlineRes as any)?.data?.onlineDoctors ?? []

  const CONFIG_ITEMS = [
    { label: 'Payment Gateway',        value: 'Razorpay (Active)',  status: 'active' },
    { label: 'SMS Provider',           value: 'Twilio',             status: 'active' },
    { label: 'Email Provider',         value: 'SendGrid',           status: 'active' },
    { label: 'Pharmacy Delivery Radius', value: '15 km',            status: 'config' },
    { label: 'Home Visit Radius',      value: '25 km',              status: 'config' },
    { label: 'Consultation Fee GST',   value: '5%',                 status: 'config' },
    { label: 'Platform Commission',    value: '10% per appointment', status: 'config' },
    { label: 'Lab Test Commission',    value: '8% per booking',     status: 'config' },
  ]

  return (
    <div className="space-y-6">
      {/* Online users */}
      <SectionCard title={`Online Doctors (${onlineDoctors.length})`} icon={Wifi}>
        {onlineDoctors.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">No doctors are online right now</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {onlineDoctors.map((d: any) => (
              <div key={d.id} className="flex items-center gap-4 px-5 py-3">
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700 text-sm font-bold">{d.user?.name?.slice(0, 2).toUpperCase()}</div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{d.user?.name}</p>
                  <p className="text-xs text-gray-400">{d.specialization ?? '—'}</p>
                </div>
                <Wifi className="ml-auto h-4 w-4 text-green-500" />
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* System config */}
      <SectionCard title="System Configuration" icon={Settings}>
        <div className="divide-y divide-gray-50">
          {CONFIG_ITEMS.map(item => (
            <div key={item.label} className="flex items-center justify-between px-5 py-3">
              <span className="text-sm text-gray-700">{item.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                <Badge label={item.status === 'active' ? 'Active' : 'Configured'} color={item.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'} />
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 px-5 py-4">
          <p className="text-xs text-gray-400">Configuration changes require a backend deployment. Contact the platform administrator to modify system settings.</p>
        </div>
      </SectionCard>

      {/* Notification templates */}
      <SectionCard title="Notification Templates" icon={Activity}>
        <div className="divide-y divide-gray-50">
          {[
            { name: 'Appointment Confirmed', channel: 'SMS + Email', status: 'Active' },
            { name: 'Prescription Ready',    channel: 'Push + SMS',  status: 'Active' },
            { name: 'Order Shipped',         channel: 'SMS + Push',  status: 'Active' },
            { name: 'Lab Report Ready',      channel: 'Email + Push', status: 'Active' },
            { name: 'Membership Expiry',     channel: 'Email + SMS', status: 'Active' },
          ].map(t => (
            <div key={t.name} className="flex items-center justify-between px-5 py-3">
              <div><p className="text-sm font-medium text-gray-900">{t.name}</p><p className="text-xs text-gray-400">{t.channel}</p></div>
              <Badge label={t.status} color="bg-green-50 text-green-600" />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

// ─── Pharmacies Tab ───────────────────────────────────────────────────────────

function PharmaciesTab({ isAdmin }: { isAdmin: boolean }) {
  const qc = useQueryClient()

  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-pharmacies'],
    queryFn: () => adminApi.listPharmacies().then(r => r.data),
    enabled: isAdmin,
  })
  const toggleMut = useMutation({
    mutationFn: (id: string) => adminApi.togglePharmacy(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-pharmacies'] }),
  })

  const pharmacies: any[] = (res as any)?.data ?? []

  return (
    <SectionCard title={`Pharmacies (${pharmacies.length})`} icon={Building2}>
      {isLoading ? <Spinner /> : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>{['Name', 'City', 'Owner', 'Phone', 'Orders', 'Status', 'Action'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pharmacies.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.address ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.city ?? '—'}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900">{p.owner?.name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{p.owner?.email ?? ''}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">{p._count?.orders ?? 0}</td>
                  <td className="px-4 py-3">
                    <Badge label={p.isActive ? 'Active' : 'Suspended'} color={p.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleMut.mutate(p.id)}
                      disabled={toggleMut.isPending}
                      className={`rounded-lg border px-3 py-1 text-xs font-semibold ${p.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                    >
                      {p.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {pharmacies.length === 0 && <EmptyRow cols={7} msg="No pharmacies registered yet" />}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  )
}

// ─── Labs Tab ─────────────────────────────────────────────────────────────────

function LabsTab({ isAdmin }: { isAdmin: boolean }) {
  const qc = useQueryClient()

  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-labs'],
    queryFn: () => adminApi.listLabCenters().then(r => r.data),
    enabled: isAdmin,
  })
  const toggleMut = useMutation({
    mutationFn: (id: string) => adminApi.toggleLab(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-labs'] }),
  })

  const labs: any[] = (res as any)?.data ?? []

  return (
    <SectionCard title={`Lab Centers (${labs.length})`} icon={FlaskConical}>
      {isLoading ? <Spinner /> : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>{['Name', 'City', 'Owner', 'Tests', 'Bookings', 'Status', 'Action'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {labs.map((lab: any) => (
                <tr key={lab.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">{lab.name}</p>
                    <p className="text-xs text-gray-400">{lab.address ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{lab.city ?? '—'}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900">{lab.owner?.name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{lab.owner?.email ?? ''}</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">{lab._count?.tests ?? 0}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">{lab._count?.bookings ?? 0}</td>
                  <td className="px-4 py-3">
                    <Badge label={lab.isActive ? 'Active' : 'Suspended'} color={lab.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleMut.mutate(lab.id)}
                      disabled={toggleMut.isPending}
                      className={`rounded-lg border px-3 py-1 text-xs font-semibold ${lab.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                    >
                      {lab.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {labs.length === 0 && <EmptyRow cols={7} msg="No lab centers registered yet" />}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function AdminDashboardPage() {
  const user    = authStore((s: any) => s.user)
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('overview')
  const isAdmin = !!user && (user as any).role === 'admin'

  const handleLogout = () => {
    authStore.getState().clearAuth()
    navigate(ROUTES.login)
  }

  if (user && (user as any).role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <ShieldCheck className="h-16 w-16 text-gray-300" />
          <h2 className="text-xl font-bold text-gray-700">Access Denied</h2>
          <p className="text-sm text-gray-400">Admin access required</p>
        </div>
        <Footer />
      </div>
    )
  }

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview',      label: 'Overview',     icon: BarChart3 },
    { id: 'users',         label: 'Users',         icon: Users },
    { id: 'doctors',       label: 'Doctors',       icon: Stethoscope },
    { id: 'plans',         label: 'Memberships',   icon: Crown },
    { id: 'coupons',       label: 'Coupons',       icon: Tag },
    { id: 'appointments',  label: 'Appointments',  icon: Calendar },
    { id: 'orders',        label: 'Orders',        icon: Package },
    { id: 'payouts',       label: 'Payouts',       icon: DollarSign },
    { id: 'pharmacies',    label: 'Pharmacies',    icon: Building2 },
    { id: 'labs',          label: 'Labs',          icon: FlaskConical },
    { id: 'system',        label: 'System',        icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-0.5 text-sm text-gray-500">Novetta Healthcare Platform — Full Control Panel</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge label="Admin" color="bg-rose-100 text-rose-700" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:border-rose-300 hover:text-rose-600 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-gray-100 bg-white p-1 shadow-sm">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all sm:text-sm ${tab === id ? 'bg-brand-500 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Icon className="h-4 w-4" /><span className="hidden sm:inline">{label}</span><span className="sm:hidden">{label.slice(0, 4)}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'overview'     && <OverviewTab      isAdmin={isAdmin} />}
        {tab === 'users'        && <UsersTab         isAdmin={isAdmin} />}
        {tab === 'doctors'      && <DoctorsTab        isAdmin={isAdmin} />}
        {tab === 'plans'        && <PlansTab          isAdmin={isAdmin} />}
        {tab === 'coupons'      && <CouponsTab        isAdmin={isAdmin} />}
        {tab === 'appointments' && <AppointmentsTab   isAdmin={isAdmin} />}
        {tab === 'orders'       && <OrdersTab         isAdmin={isAdmin} />}
        {tab === 'payouts'      && <PayoutsTab        isAdmin={isAdmin} />}
        {tab === 'pharmacies'   && <PharmaciesTab     isAdmin={isAdmin} />}
        {tab === 'labs'         && <LabsTab           isAdmin={isAdmin} />}
        {tab === 'system'       && <SystemTab         isAdmin={isAdmin} />}
      </div>
      <Footer />
    </div>
  )
}
