import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FlaskConical, Users, Package, ShieldCheck, BarChart3,
  Check, X, Send, RefreshCw, Pill, AlertTriangle, CheckCircle,
  XCircle, ChevronLeft, ChevronRight, Eye, Layers, LogOut,
  Clock, MessageSquare, Plus, Save, Fingerprint,
} from 'lucide-react'
import { Navbar } from '../../../components/layouts/Navbar'
import { pharmacistPanelApi, pharmacyApi, type PharmacistSession } from '../../../lib/api'
import { authStore } from '../../auth/store/authStore'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'

type Tab = 'queue' | 'inventory' | 'orders' | 'prescriptions' | 'chat'

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>{label}</span>
}

function StockBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    in_stock: 'bg-green-100 text-green-700',
    low_stock: 'bg-amber-100 text-amber-700',
    out_of_stock: 'bg-red-100 text-red-700',
  }
  const labels: Record<string, string> = { in_stock: 'In Stock', low_stock: 'Low Stock', out_of_stock: 'Out of Stock' }
  return <Badge label={labels[status] ?? status} color={map[status] ?? 'bg-gray-100 text-gray-600'} />
}

function Spinner() {
  return <div className="flex justify-center py-10"><div className="h-7 w-7 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" /></div>
}

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      {title && <h3 className="mb-4 text-base font-semibold text-gray-900">{title}</h3>}
      {children}
    </div>
  )
}

// ─── Queue Tab ────────────────────────────────────────────────────────────────

function QueueTab() {
  const qc = useQueryClient()
  const [activeSession, setActiveSession] = useState<PharmacistSession | null>(null)
  const [showRx, setShowRx] = useState(false)
  const [rxNotes, setRxNotes] = useState('')
  const [sessionNotes, setSessionNotes] = useState('')
  const [rxItems, setRxItems] = useState([{ medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }])
  const [signature, setSignature] = useState<any>(null)
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: queueData, isLoading: queueLoading } = useQuery({
    queryKey: ['pharmacist', 'queue'],
    queryFn: () => pharmacistPanelApi.getQueue().then(r => r.data),
    refetchInterval: 15000,
  })

  const { data: messagesData } = useQuery({
    queryKey: ['pharmacist', 'chat', activeSession?.patient?.id],
    queryFn: () => pharmacistPanelApi.getMessages(activeSession!.patient!.id).then(r => r.data),
    enabled: !!activeSession?.patient?.id,
    refetchInterval: 10000,
  })

  const { data: patientSummary } = useQuery({
    queryKey: ['pharmacist', 'patient-summary', activeSession?.patient?.id],
    queryFn: () => pharmacistPanelApi.getPatientSummary(activeSession!.patient!.id).then(r => r.data),
    enabled: !!activeSession?.patient?.id,
  })

  const acceptMut = useMutation({
    mutationFn: (id: string) => pharmacistPanelApi.acceptSession(id),
    onSuccess: (res: any) => {
      setActiveSession(res.data?.data ?? null)
      qc.invalidateQueries({ queryKey: ['pharmacist', 'queue'] })
    },
  })

  const sendMut = useMutation({
    mutationFn: ({ receiverId, msg }: { receiverId: string; msg: string }) =>
      pharmacistPanelApi.sendMessage(receiverId, msg),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pharmacist', 'chat'] })
      setMessage('')
    },
  })

  const prescribeMut = useMutation({
    mutationFn: (data: any) => pharmacistPanelApi.issuePrescription(activeSession!.id, data),
    onSuccess: (res: any) => {
      setSignature(res.data?.data?.signature ?? null)
      setShowRx(false)
      qc.invalidateQueries({ queryKey: ['pharmacist'] })
    },
  })

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messagesData])

  const queue: PharmacistSession[] = (queueData as any)?.data ?? []
  const messages: any[] = (messagesData as any)?.data ?? []
  const summary: any = (patientSummary as any)?.data

  const handlePrescribe = () => {
    if (!activeSession?.patient?.id) return
    const validItems = rxItems.filter(i => i.medicineName.trim())
    if (!validItems.length) return
    prescribeMut.mutate({ patientId: activeSession.patient.id, notes: rxNotes, sessionNotes, items: validItems })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Patient Queue</h3>
        <button onClick={() => qc.invalidateQueries({ queryKey: ['pharmacist', 'queue'] })}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-500">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {queueLoading ? <Spinner /> : queue.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No patients in queue</p>
      ) : (
        <div className="space-y-3">
          {queue.map(s => (
            <div key={s.id} className={`rounded-xl border p-4 ${activeSession?.id === s.id ? 'border-purple-300 bg-purple-50' : 'border-gray-100 bg-white'} shadow-sm`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{s.patient?.name ?? 'Patient'}</p>
                  <p className="text-xs text-gray-400">{s.patient?.email}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {s.symptoms.map(sym => (
                      <span key={sym} className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">{sym}</span>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{new Date(s.createdAt).toLocaleTimeString()}</p>
                </div>
                <div className="flex gap-2">
                  {s.status === 'waiting' && (
                    <button onClick={() => acceptMut.mutate(s.id)}
                      className="flex items-center gap-1 rounded-lg bg-purple-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-600">
                      <Check className="h-3 w-3" /> Accept
                    </button>
                  )}
                  {s.status === 'active' && (
                    <button onClick={() => setActiveSession(s)}
                      className="flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600">
                      <MessageSquare className="h-3 w-3" /> Open Chat
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active session panel */}
      {activeSession && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Chat */}
          <div className="lg:col-span-2 flex flex-col h-[480px] rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{activeSession.patient?.name}</p>
                <p className="text-xs text-gray-400">Active consultation</p>
              </div>
              <button onClick={() => setShowRx(v => !v)}
                className="flex items-center gap-1.5 rounded-lg bg-purple-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-600">
                <Pill className="h-3.5 w-3.5" /> {showRx ? 'Hide Rx' : 'Issue Prescription'}
              </button>
            </div>

            {showRx ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Session Notes</label>
                  <textarea value={sessionNotes} onChange={e => setSessionNotes(e.target.value)} rows={2}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                    placeholder="Consultation notes..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Prescription Notes</label>
                  <textarea value={rxNotes} onChange={e => setRxNotes(e.target.value)} rows={2}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                    placeholder="General instructions..." />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-600">Medicines</label>
                    <button onClick={() => setRxItems(i => [...i, { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }])}
                      className="flex items-center gap-1 text-xs text-purple-500"><Plus className="h-3 w-3" /> Add</button>
                  </div>
                  {rxItems.map((item, idx) => (
                    <div key={idx} className="mb-2 space-y-1.5 rounded-lg border border-gray-100 bg-gray-50 p-3">
                      <div className="flex gap-2">
                        <input value={item.medicineName} onChange={e => setRxItems(prev => prev.map((it, i) => i === idx ? { ...it, medicineName: e.target.value } : it))}
                          placeholder="Medicine name *" className="flex-1 rounded border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:border-purple-400" />
                        {rxItems.length > 1 && <button onClick={() => setRxItems(prev => prev.filter((_, i) => i !== idx))}><X className="h-4 w-4 text-red-400" /></button>}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['dosage', 'frequency', 'duration', 'instructions'] as const).map(f => (
                          <input key={f} value={item[f]} onChange={e => setRxItems(prev => prev.map((it, i) => i === idx ? { ...it, [f]: e.target.value } : it))}
                            placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                            className="rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:border-purple-400" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={handlePrescribe} disabled={prescribeMut.isPending || !rxItems.some(i => i.medicineName.trim())}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
                  <Fingerprint className="h-4 w-4" />
                  {prescribeMut.isPending ? 'Signing & Issuing...' : 'Issue with Digital Signature'}
                </button>
                {signature && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-xs space-y-1">
                    <p className="flex items-center gap-1.5 font-semibold text-green-700"><CheckCircle className="h-3.5 w-3.5" /> Prescription Digitally Signed</p>
                    <p className="text-gray-600">Signed by: <strong>{signature.pharmacistName}</strong></p>
                    <p className="text-gray-600">Algorithm: {signature.algorithm}</p>
                    <p className="text-gray-500 font-mono break-all">{signature.hash.slice(0, 32)}...</p>
                    <p className="text-gray-400">{new Date(signature.timestamp).toLocaleString()}</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-2 p-4">
                  {messages.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-8">No messages yet. Start the consultation.</p>
                  ) : messages.map((m: any) => (
                    <div key={m.id} className={`flex ${m.isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${m.isMine ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
                        {m.message}
                        <p className={`mt-0.5 text-right text-[10px] ${m.isMine ? 'text-purple-200' : 'text-gray-400'}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="border-t border-gray-100 p-3">
                  <div className="flex gap-2">
                    <input value={message} onChange={e => setMessage(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && message.trim()) { sendMut.mutate({ receiverId: activeSession.patient!.id, msg: message }); e.preventDefault() } }}
                      placeholder="Type a message..." className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none" />
                    <button onClick={() => { if (message.trim()) sendMut.mutate({ receiverId: activeSession.patient!.id, msg: message }) }}
                      disabled={!message.trim()} className="rounded-xl bg-purple-500 p-2.5 text-white hover:bg-purple-600 disabled:opacity-50">
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Patient summary */}
          <div className="space-y-3">
            <SectionCard title="Patient Summary">
              {!summary ? <Spinner /> : (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Name</p>
                    <p className="font-medium">{summary.patient?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="font-medium">{summary.patient?.phone ?? '—'}</p>
                  </div>
                  {summary.medicalHistory?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Active Conditions</p>
                      {summary.medicalHistory.map((h: any) => (
                        <span key={h.id} className="mr-1 mb-1 inline-block rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600">{h.condition}</span>
                      ))}
                    </div>
                  )}
                  {summary.recentPrescriptions?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Recent Prescriptions</p>
                      {summary.recentPrescriptions.map((rx: any) => (
                        <div key={rx.id} className="mb-1 rounded bg-gray-50 p-2 text-xs">
                          <p className="text-gray-400">{new Date(rx.createdAt).toLocaleDateString()}</p>
                          {rx.items.slice(0, 2).map((i: any) => <p key={i.id} className="text-gray-700">{i.medicineName}</p>)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Inventory Tab ────────────────────────────────────────────────────────────

function InventoryTab({ pharmacyId }: { pharmacyId: string }) {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [editItem, setEditItem] = useState<{ medicineId: string; stock: number; price: number; lowThreshold: number } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['pharmacist', 'inventory', pharmacyId],
    queryFn: () => pharmacistPanelApi.getInventory(pharmacyId).then(r => r.data),
    enabled: !!pharmacyId,
  })

  const { data: allMeds } = useQuery({
    queryKey: ['medicines-search', search],
    queryFn: () => pharmacyApi.searchMedicines({ q: search, page: 1 }).then(r => r.data),
    enabled: search.length > 1,
  })

  const saveMut = useMutation({
    mutationFn: (d: any) => pharmacistPanelApi.upsertInventory(pharmacyId, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pharmacist', 'inventory'] }); setEditItem(null) },
  })

  const items: any[] = (data as any)?.data ?? []
  const medicines: any[] = (allMeds as any)?.data ?? []

  return (
    <div className="space-y-4">
      {!pharmacyId && <p className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">No pharmacy linked to your account. Contact admin.</p>}

      {/* Add / update stock form */}
      <SectionCard title="Update Stock">
        <div className="space-y-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search medicine to add/update..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none" />
          {medicines.length > 0 && search.length > 1 && (
            <div className="rounded-lg border border-gray-100 divide-y divide-gray-50 max-h-40 overflow-y-auto">
              {medicines.map((m: any) => (
                <button key={m.id} onClick={() => { setEditItem({ medicineId: m.id, stock: 0, price: Number(m.price), lowThreshold: 5 }); setSearch(m.name) }}
                  className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 text-left">
                  <span>{m.name}</span>
                  <span className="text-xs text-gray-400">Rs {Number(m.price).toFixed(0)}</span>
                </button>
              ))}
            </div>
          )}
          {editItem && (
            <div className="grid grid-cols-3 gap-2 items-end">
              <div>
                <label className="text-xs text-gray-500">Stock Qty</label>
                <input type="number" min={0} value={editItem.stock} onChange={e => setEditItem(p => p ? { ...p, stock: Number(e.target.value) } : null)}
                  className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-purple-400 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Price (Rs)</label>
                <input type="number" min={0} step="0.01" value={editItem.price} onChange={e => setEditItem(p => p ? { ...p, price: Number(e.target.value) } : null)}
                  className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-purple-400 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Low Alert ≤</label>
                <input type="number" min={1} value={editItem.lowThreshold} onChange={e => setEditItem(p => p ? { ...p, lowThreshold: Number(e.target.value) } : null)}
                  className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-purple-400 focus:outline-none" />
              </div>
              <button onClick={() => saveMut.mutate(editItem)} disabled={saveMut.isPending}
                className="col-span-3 flex items-center justify-center gap-1.5 rounded-lg bg-purple-500 py-2 text-sm font-medium text-white hover:bg-purple-600 disabled:opacity-50">
                <Save className="h-4 w-4" /> {saveMut.isPending ? 'Saving...' : 'Save to Inventory'}
              </button>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Current inventory */}
      {isLoading ? <Spinner /> : items.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No inventory items yet</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                <th className="px-4 py-3 font-medium">Medicine</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium text-right">Price</th>
                <th className="px-4 py-3 font-medium text-right">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item: any) => (
                <tr key={item.id} className={item.stock <= item.lowThreshold && item.stock > 0 ? 'bg-amber-50' : ''}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{item.medicine?.name}</p>
                    {item.medicine?.genericName && <p className="text-xs text-gray-400">{item.medicine.genericName}</p>}
                    {item.medicine?.prescriptionRequired && <span className="text-xs text-red-500">Rx Required</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{item.medicine?.category ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-medium">Rs {Number(item.price).toFixed(0)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={item.stock <= item.lowThreshold ? 'font-bold text-amber-600' : 'text-gray-900'}>{item.stock}</span>
                    {item.stock <= item.lowThreshold && item.stock > 0 && (
                      <AlertTriangle className="inline ml-1 h-3.5 w-3.5 text-amber-500" />
                    )}
                  </td>
                  <td className="px-4 py-3"><StockBadge status={item.stockStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab({ pharmacyId }: { pharmacyId: string }) {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['pharmacist', 'orders', pharmacyId, statusFilter, page],
    queryFn: () => pharmacistPanelApi.getOrders({ pharmacyId, status: statusFilter, page }).then(r => r.data),
  })

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => pharmacistPanelApi.updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacist', 'orders'] }),
  })

  const orders: any[] = (data as any)?.data ?? []
  const pages: number = (data as any)?.pages ?? 1

  const ORDER_STATUSES = ['pending', 'processing', 'ready', 'dispatched', 'delivered', 'cancelled']

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'processing', 'ready', 'dispatched', 'delivered'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${statusFilter === s ? 'bg-purple-500 text-white' : 'border border-gray-200 text-gray-600 hover:border-purple-300'}`}>
            {s}
          </button>
        ))}
      </div>

      {isLoading ? <Spinner /> : orders.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">No orders found</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o: any) => (
            <div key={o.id} className="rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold text-gray-900">{o.patient?.name}</p>
                  <p className="text-xs text-gray-400">{o.patient?.phone} · {o.deliveryType} · Rs {Number(o.totalAmount).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString()}</p>
                  {o.prescriptionStatus && (
                    <span className={`text-xs font-medium ${o.prescriptionStatus === 'approved' ? 'text-green-600' : o.prescriptionStatus === 'rejected' ? 'text-red-600' : 'text-amber-600'}`}>
                      Rx: {o.prescriptionStatus}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select value={o.status} onChange={e => statusMut.mutate({ id: o.id, status: e.target.value })}
                    className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-purple-400 focus:outline-none">
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:border-purple-300">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {expandedId === o.id && (
                <div className="border-t border-gray-100 p-4 space-y-2">
                  <p className="text-xs font-medium text-gray-500">Items</p>
                  {o.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.medicine?.name} × {item.quantity}</span>
                      <span className="text-gray-500">Rs {Number(item.price).toFixed(0)}</span>
                    </div>
                  ))}
                  {o.address && <p className="text-xs text-gray-400 mt-1">Deliver to: {o.address}</p>}
                  {o.prescription && (
                    <div className="rounded-lg bg-blue-50 p-2 text-xs text-blue-700">
                      Prescription attached · {o.prescription.items?.length ?? 0} medicines
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
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

// ─── Prescription Validation Tab ──────────────────────────────────────────────

function PrescriptionsTab({ pharmacyId }: { pharmacyId: string }) {
  const qc = useQueryClient()
  const [note, setNote] = useState<Record<string, string>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['pharmacist', 'orders', pharmacyId, 'pending', 1],
    queryFn: () => pharmacistPanelApi.getOrders({ pharmacyId, status: 'pending', page: 1 }).then(r => r.data),
  })

  const validateMut = useMutation({
    mutationFn: ({ id, approved, n }: { id: string; approved: boolean; n?: string }) =>
      pharmacistPanelApi.validatePrescription(id, approved, n),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacist', 'orders'] }),
  })

  const orders: any[] = ((data as any)?.data ?? []).filter((o: any) => o.prescription && !o.prescriptionStatus)

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Review prescription-attached orders before dispensing.</p>
      {isLoading ? <Spinner /> : orders.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No prescriptions pending review</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o: any) => (
            <SectionCard key={o.id}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{o.patient?.name}</p>
                  <p className="text-xs text-gray-400">Order #{o.id.slice(-8)} · Rs {Number(o.totalAmount).toFixed(0)} · {o.deliveryType}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">Pending Review</span>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 mb-3 text-sm space-y-1">
                <p className="text-xs font-medium text-gray-500 mb-1">Prescription Items</p>
                {o.prescription?.items?.map((i: any) => (
                  <div key={i.id} className="flex gap-2 text-gray-700">
                    <Pill className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>{i.medicineName}</strong>{i.dosage && ` · ${i.dosage}`}{i.frequency && ` · ${i.frequency}`}</span>
                  </div>
                ))}
              </div>
              <textarea value={note[o.id] ?? ''} onChange={e => setNote(prev => ({ ...prev, [o.id]: e.target.value }))}
                rows={2} placeholder="Add a note (required for rejection)..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none mb-3" />
              <div className="flex gap-2">
                <button onClick={() => validateMut.mutate({ id: o.id, approved: true, n: note[o.id] })}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-500 py-2 text-sm font-medium text-white hover:bg-green-600">
                  <CheckCircle className="h-4 w-4" /> Approve & Dispense
                </button>
                <button onClick={() => validateMut.mutate({ id: o.id, approved: false, n: note[o.id] })}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-500 py-2 text-sm font-medium text-white hover:bg-red-600">
                  <XCircle className="h-4 w-4" /> Reject & Refund
                </button>
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function PharmacistConsolePage() {
  const navigate = useNavigate()
  const { accessToken, user } = authStore((s: any) => ({ accessToken: s.accessToken, user: s.user }))
  const [tab, setTab] = useState<Tab>('queue')

  const { data: meData } = useQuery({
    queryKey: ['pharmacist', 'me'],
    queryFn: () => pharmacistPanelApi.getMe().then(r => r.data),
    enabled: !!accessToken,
  })

  const handleLogout = () => { authStore.getState().clearAuth(); navigate(ROUTES.login) }

  const userRole = (user as any)?.role
  if (accessToken && userRole && userRole !== 'pharmacist') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100 max-w-sm text-center">
          <FlaskConical className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h2 className="mb-2 text-xl font-bold text-gray-900">Pharmacist Access Required</h2>
          <p className="mb-5 text-sm text-gray-500">Contact admin to assign the pharmacist role to your account.</p>
          <button onClick={() => navigate(ROUTES.welcome)} className="w-full rounded-lg bg-purple-500 py-2.5 text-sm font-semibold text-white hover:bg-purple-600">Go Home</button>
        </div>
      </div>
    )
  }

  const pharmacy: any = (meData as any)?.data
  const pharmacyId: string = pharmacy?.id ?? ''

  const TABS = [
    { id: 'queue' as Tab,         label: 'Patient Queue',  icon: Users },
    { id: 'inventory' as Tab,     label: 'Inventory',      icon: Layers },
    { id: 'orders' as Tab,        label: 'Orders',         icon: Package },
    { id: 'prescriptions' as Tab, label: 'Rx Validation',  icon: ShieldCheck },
    { id: 'chat' as Tab,          label: 'Analytics',      icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Pharmacist Console</h1>
            <p className="text-sm text-gray-500">
              {pharmacy ? `${pharmacy.name} · ${pharmacy.city ?? ''}` : 'No pharmacy linked'}
            </p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:border-rose-300 hover:text-rose-600 transition-colors">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Tab bar */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-gray-100 bg-white p-1 shadow-sm">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${tab === id ? 'bg-purple-500 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Icon className="h-4 w-4" /><span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          {tab === 'queue'         && <QueueTab />}
          {tab === 'inventory'     && <InventoryTab pharmacyId={pharmacyId} />}
          {tab === 'orders'        && <OrdersTab pharmacyId={pharmacyId} />}
          {tab === 'prescriptions' && <PrescriptionsTab pharmacyId={pharmacyId} />}
          {tab === 'chat'          && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Pharmacy analytics coming soon.</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[
                  { label: 'Total Orders', icon: Package, color: 'bg-purple-50 text-purple-600' },
                  { label: 'Consultations Today', icon: Users, color: 'bg-blue-50 text-blue-600' },
                  { label: 'Rx Validated', icon: ShieldCheck, color: 'bg-green-50 text-green-600' },
                ].map(({ label, icon: Icon, color }) => (
                  <div key={label} className="rounded-xl border border-gray-100 p-4 shadow-sm text-center">
                    <div className={`inline-flex rounded-lg p-2 mb-2 ${color}`}><Icon className="h-5 w-5" /></div>
                    <p className="text-2xl font-bold text-gray-900">—</p>
                    <p className="text-sm text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
