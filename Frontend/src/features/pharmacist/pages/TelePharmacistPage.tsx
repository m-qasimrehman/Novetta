import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  FlaskConical, MessageSquare, Plus, X, ShoppingCart, Loader2,
  AlertCircle, CheckCircle, Package, ChevronRight, Info,
  Video, Clock, Send, User, CheckCircle2, XCircle,
} from 'lucide-react'
import { Navbar } from '../../../components/layouts/Navbar'
import { Footer } from '../../../components/layouts/Footer'
import { pharmacyApi, type Medicine, type PharmacistSession } from '../../../lib/api'
import { ROUTES } from '../../../constants/routes'
import { authStore } from '../../auth/store/authStore'

const QUICK_SYMPTOMS = [
  'Headache', 'Fever', 'Cold & Flu', 'Cough', 'Acidity',
  'Stomach pain', 'Allergy', 'Body pain', 'Diarrhea', 'Constipation',
  'Skin rash', 'Eye irritation', 'Vitamin deficiency', 'Sleep issues',
]

interface ConsultResult {
  symptoms: string[]
  advice: string
  disclaimer: string
  recommendations: Medicine[]
}

type Tab = 'otc' | 'live'

// ── OTC Tab ─────────────────────────────────────────────────────────────────
function OTCTab() {
  const navigate = useNavigate()
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [customInput, setCustomInput] = useState('')
  const [result, setResult] = useState<ConsultResult | null>(null)
  const [cart, setCart] = useState<{ medicine: Medicine; quantity: number }[]>([])

  const consultMutation = useMutation({
    mutationFn: () => pharmacyApi.pharmacistConsult(symptoms),
    onSuccess: res => setResult((res.data as any)?.data),
  })

  const addSymptom = (sym: string) => {
    if (!symptoms.includes(sym)) setSymptoms(prev => [...prev, sym])
  }
  const addCustom = () => {
    const trimmed = customInput.trim()
    if (trimmed && !symptoms.includes(trimmed)) {
      setSymptoms(prev => [...prev, trimmed])
      setCustomInput('')
    }
  }
  const removeSymptom = (sym: string) => setSymptoms(prev => prev.filter(s => s !== sym))
  const addToCart = (med: Medicine) => {
    setCart(prev => {
      const existing = prev.find(i => i.medicine.id === med.id)
      if (existing) return prev.map(i => i.medicine.id === med.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { medicine: med, quantity: 1 }]
    })
  }
  const goToPharmacy = () => navigate(`${ROUTES.pharmacy}?fromPharmacist=1`)

  if (result) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 flex items-start gap-4">
          <CheckCircle className="h-8 w-8 text-green-500 shrink-0" />
          <div>
            <p className="font-bold text-green-800">Recommendation ready</p>
            <p className="text-sm text-green-600 mt-1">For: {result.symptoms.join(', ')}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
          <h3 className="font-bold text-purple-900 mb-2">Pharmacist Advice</h3>
          <p className="text-sm text-purple-700">{result.advice}</p>
        </div>

        {result.recommendations.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="font-bold text-gray-900 mb-4">Recommended OTC Medicines</h3>
            <div className="space-y-3">
              {result.recommendations.map(med => {
                const inCart = cart.find(i => i.medicine.id === med.id)
                return (
                  <div key={med.id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 hover:bg-gray-50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                      <Package className="h-5 w-5 text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{med.name}</p>
                      {med.genericName && <p className="text-xs text-gray-400">{med.genericName}</p>}
                      <p className="text-xs font-bold text-brand-600 mt-0.5">PKR {Number(med.price).toLocaleString()}</p>
                    </div>
                    {inCart ? (
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-600">In Cart ✓</span>
                    ) : (
                      <button
                        onClick={() => addToCart(med)}
                        disabled={!med.inStock}
                        className="flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-40 shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs text-gray-500 italic">{result.disclaimer}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { setResult(null); setSymptoms([]); setCart([]) }}
            className="flex-1 rounded-xl border border-gray-200 py-3 font-semibold text-gray-600 hover:bg-gray-50"
          >
            New Consultation
          </button>
          {cart.length > 0 && (
            <button
              onClick={goToPharmacy}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 font-semibold text-white hover:bg-brand-600"
            >
              <ShoppingCart className="h-4 w-4" /> Order Medicines
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <div
          onClick={() => navigate(ROUTES.doctors)}
          className="cursor-pointer rounded-xl border border-brand-200 bg-brand-50 p-4 flex items-center justify-between hover:bg-brand-100 transition-colors"
        >
          <div>
            <p className="font-semibold text-brand-800 text-sm">Need a doctor's advice?</p>
            <p className="text-xs text-brand-600">Book a telehealth consultation</p>
          </div>
          <ChevronRight className="h-5 w-5 text-brand-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-purple-500" />
          What are your symptoms?
        </h2>

        {symptoms.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {symptoms.map(sym => (
              <span key={sym} className="flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
                {sym}
                <button onClick={() => removeSymptom(sym)} className="hover:text-red-500">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-purple-400 focus:outline-none"
            placeholder="Type a symptom..."
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustom()}
          />
          <button
            onClick={addCustom}
            disabled={!customInput.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-purple-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40 hover:bg-purple-600"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 mb-2">Common symptoms:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_SYMPTOMS.map(sym => (
              <button
                key={sym}
                onClick={() => addSymptom(sym)}
                disabled={symptoms.includes(sym)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${symptoms.includes(sym) ? 'border-purple-300 bg-purple-100 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600'}`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          This service provides general OTC medicine guidance only. It does not replace a medical consultation.
        </p>
      </div>

      {consultMutation.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">Consultation failed. Please try again.</p>
        </div>
      )}

      <button
        onClick={() => consultMutation.mutate()}
        disabled={symptoms.length === 0 || consultMutation.isPending}
        className="w-full rounded-2xl bg-purple-600 py-4 font-bold text-white text-lg disabled:opacity-40 hover:bg-purple-700 flex items-center justify-center gap-2"
      >
        {consultMutation.isPending ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> Consulting pharmacist...</>
        ) : (
          <><FlaskConical className="h-5 w-5" /> Get Medicine Recommendations</>
        )}
      </button>
    </div>
  )
}

// ── Live Chat Tab ────────────────────────────────────────────────────────────
function LiveTab() {
  const qc = useQueryClient()
  const { user } = authStore((s: any) => ({ user: s.user }))
  const myId = (user as any)?.id as string | undefined

  const [symptoms, setSymptoms] = useState<string[]>([])
  const [customInput, setCustomInput] = useState('')
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Poll sessions every 5s
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['myConsultSessions'],
    queryFn: () => pharmacyApi.getMyConsultSessions(),
    refetchInterval: 5000,
  })

  const sessions: PharmacistSession[] = (sessionsData?.data as any)?.data ?? []
  const activeSession = sessions.find(s => s.status === 'active' || s.status === 'waiting')

  const pharmacistId = activeSession?.pharmacistId ?? null

  // Poll chat messages when session is active
  const { data: chatData } = useQuery({
    queryKey: ['patientChat', pharmacistId],
    queryFn: () => pharmacyApi.getPatientChatMessages(pharmacistId!),
    enabled: !!pharmacistId && activeSession?.status === 'active',
    refetchInterval: 3000,
  })
  const messages: any[] = (chatData?.data as any)?.data ?? []

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const createMutation = useMutation({
    mutationFn: () => pharmacyApi.createConsultSession(symptoms),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['myConsultSessions'] }); setSymptoms([]) },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => pharmacyApi.cancelConsultSession(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myConsultSessions'] }),
  })

  const sendMutation = useMutation({
    mutationFn: () => pharmacyApi.sendPatientMessage(pharmacistId!, chatInput.trim()),
    onSuccess: () => {
      setChatInput('')
      qc.invalidateQueries({ queryKey: ['patientChat', pharmacistId] })
    },
  })

  const addSymptom = (sym: string) => { if (!symptoms.includes(sym)) setSymptoms(p => [...p, sym]) }
  const addCustom = () => {
    const t = customInput.trim()
    if (t && !symptoms.includes(t)) { setSymptoms(p => [...p, t]); setCustomInput('') }
  }
  const removeSymptom = (sym: string) => setSymptoms(p => p.filter(s => s !== sym))

  if (sessionsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  // ── Active/Waiting session UI ─────────────────────────────────────────────
  if (activeSession) {
    const isWaiting = activeSession.status === 'waiting'
    const isActive = activeSession.status === 'active'

    return (
      <div className="space-y-4">
        {/* Session status banner */}
        <div className={`rounded-2xl border p-4 flex items-center gap-4 ${isWaiting ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}`}>
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${isWaiting ? 'bg-amber-100' : 'bg-green-100'}`}>
            {isWaiting ? <Clock className="h-6 w-6 text-amber-600 animate-pulse" /> : <Video className="h-6 w-6 text-green-600" />}
          </div>
          <div className="flex-1">
            <p className={`font-bold ${isWaiting ? 'text-amber-800' : 'text-green-800'}`}>
              {isWaiting ? 'Waiting for a pharmacist...' : 'Connected with pharmacist'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {isWaiting
                ? 'A pharmacist will join your session shortly. Please wait.'
                : `Session active — ${(activeSession as any).pharmacist?.name ?? 'Pharmacist'} has joined`}
            </p>
            {activeSession.symptoms.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {activeSession.symptoms.map(s => (
                  <span key={s} className="rounded-full bg-white/70 border px-2 py-0.5 text-xs text-gray-600">{s}</span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => cancelMutation.mutate(activeSession.id)}
            disabled={cancelMutation.isPending}
            className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
          >
            {cancelMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Cancel'}
          </button>
        </div>

        {/* Chat (only when active + pharmacist assigned) */}
        {isActive && pharmacistId && (
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden flex flex-col" style={{ height: '420px' }}>
            <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                <User className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{(activeSession as any).pharmacist?.name ?? 'Pharmacist'}</p>
                <p className="text-xs text-green-500 font-medium">Online</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-400">Session started. Send a message to begin.</p>
                </div>
              )}
              {messages.map((msg: any) => {
                const isMine = msg.senderId === myId || msg.sender?.id === myId
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMine ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                      <p className="text-sm">{msg.message}</p>
                      <p className={`mt-0.5 text-[10px] ${isMine ? 'text-purple-200' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={chatEndRef} />
            </div>

            <div className="border-t border-gray-100 p-3 flex gap-2">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && chatInput.trim() && sendMutation.mutate()}
                placeholder="Type your message..."
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-purple-400 focus:outline-none"
              />
              <button
                onClick={() => sendMutation.mutate()}
                disabled={!chatInput.trim() || sendMutation.isPending}
                className="rounded-xl bg-purple-600 p-2.5 text-white hover:bg-purple-700 disabled:opacity-40"
              >
                {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Prescription received */}
        {isActive && activeSession.signatureHash && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-800 text-sm">E-Prescription issued</p>
              <p className="text-xs text-green-600 mt-0.5">A signed prescription has been sent. Check your Prescriptions section.</p>
              <p className="text-[10px] text-gray-400 mt-1 font-mono break-all">Sig: {activeSession.signatureHash.slice(0, 32)}...</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── New session form ──────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5">
        <div className="flex items-center gap-3 mb-4">
          <Video className="h-6 w-6 text-purple-600" />
          <div>
            <p className="font-bold text-purple-900">Request a Live Pharmacist</p>
            <p className="text-xs text-purple-600">Describe your symptoms and a pharmacist will connect with you</p>
          </div>
        </div>

        {/* Symptoms */}
        {symptoms.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {symptoms.map(sym => (
              <span key={sym} className="flex items-center gap-1.5 rounded-full bg-purple-200 px-3 py-1 text-sm font-semibold text-purple-800">
                {sym}
                <button onClick={() => removeSymptom(sym)} className="hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 mb-3">
          <input
            className="flex-1 rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm focus:border-purple-400 focus:outline-none"
            placeholder="Describe your concern..."
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustom()}
          />
          <button
            onClick={addCustom}
            disabled={!customInput.trim()}
            className="rounded-xl bg-purple-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40 hover:bg-purple-600"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-1">
          {QUICK_SYMPTOMS.slice(0, 8).map(sym => (
            <button
              key={sym}
              onClick={() => addSymptom(sym)}
              disabled={symptoms.includes(sym)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${symptoms.includes(sym) ? 'border-purple-400 bg-purple-200 text-purple-800' : 'border-purple-200 bg-white text-purple-700 hover:border-purple-400'}`}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {createMutation.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
          <XCircle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">Failed to start session. Please try again.</p>
        </div>
      )}

      <button
        onClick={() => createMutation.mutate()}
        disabled={symptoms.length === 0 || createMutation.isPending}
        className="w-full rounded-2xl bg-purple-600 py-4 font-bold text-white text-lg disabled:opacity-40 hover:bg-purple-700 flex items-center justify-center gap-2"
      >
        {createMutation.isPending ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> Connecting...</>
        ) : (
          <><Video className="h-5 w-5" /> Start Live Consultation</>
        )}
      </button>

      {/* Recent completed sessions */}
      {sessions.filter(s => s.status === 'completed').length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="font-bold text-gray-900 mb-3 text-sm">Previous Sessions</h3>
          <div className="space-y-2">
            {sessions.filter(s => s.status === 'completed').slice(0, 3).map(s => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">
                    {new Date(s.createdAt).toLocaleDateString()} — {s.symptoms.join(', ')}
                  </p>
                  {s.sessionNotes && <p className="text-xs text-gray-600 mt-0.5 truncate">{s.sessionNotes}</p>}
                </div>
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600">Done</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export function TelePharmacistPage() {
  const [tab, setTab] = useState<Tab>('otc')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100">
            <FlaskConical className="h-7 w-7 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tele-Pharmacist</h1>
            <p className="text-sm text-gray-500">OTC guidance or connect with a live pharmacist</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="mb-6 flex rounded-2xl border border-gray-200 bg-white p-1.5">
          <button
            onClick={() => setTab('otc')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${tab === 'otc' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FlaskConical className="h-4 w-4" /> OTC Recommendation
          </button>
          <button
            onClick={() => setTab('live')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${tab === 'live' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Video className="h-4 w-4" /> Live Pharmacist
          </button>
        </div>

        {tab === 'otc' ? <OTCTab /> : <LiveTab />}
      </div>

      <Footer />
    </div>
  )
}
