import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Check, X, Tag, Crown, Zap, Users, ChevronDown, ChevronUp,
  Shield, Star, Pill, FlaskConical, Stethoscope, Truck,
  BadgeCheck, Copy, Sparkles, CreditCard, Lock, Loader2,
} from 'lucide-react'
import { Navbar } from '../../../components/layouts/Navbar'
import { Footer } from '../../../components/layouts/Footer'
import { apiClient } from '../../../lib/axios'
import { authStore } from '../../auth/store/authStore'
import { ROUTES } from '../../../constants/routes'

interface Plan {
  id: string
  name: string
  description: string
  price: string
  durationDays: number
  discountPct: number
  features: string[]
}

interface UserMembership {
  id: string
  status: string
  startedAt: string
  expiresAt: string
  plan: Plan
}

const FAQS = [
  {
    q: 'What is Novetta Gold?',
    a: 'Novetta Gold is a membership program that gives you extra discounts on medicines, lab tests, and doctor consultations on top of our already low prices.',
  },
  {
    q: 'How much can I save with Novetta Gold?',
    a: 'Gold members save an average of PKR 800–1,200 per month on medicines and lab tests. Your savings depend on how often you use the platform.',
  },
  {
    q: 'Is there a free option?',
    a: 'Yes! You can use Novetta for free and still get access to our standard discounts and price comparison across pharmacies.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. You can cancel your Gold membership at any time. Your benefits continue until the end of your billing period.',
  },
  {
    q: 'How does the Family plan work?',
    a: 'The Gold Family plan covers up to 5 family members under one account. All members get the same Gold benefits.',
  },
  {
    q: 'Where can I use my Gold discount?',
    a: 'At all partner pharmacies on our platform, including MediPlus, HealthCare Plus, City Medicals, and Apollo Pharmacy.',
  },
]

const PARTNER_PHARMACIES = [
  'MediPlus Pharmacy', 'HealthCare Plus', 'City Medicals',
  'Apollo Pharmacy', 'Shifa Medical Store', 'Dawaai.pk',
  'Fazal Din Pharmacy', 'ICI Pharmacy',
]

const COUPONS = [
  { code: 'FIRST10',  label: '10% off first order',          color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { code: 'LAB50',    label: '50% off lab tests',            color: 'bg-green-50 text-green-700 border-green-200' },
  { code: 'CONSULT',  label: 'PKR 100 off consultation',     color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { code: 'SAVE200',  label: 'PKR 200 off orders above 999', color: 'bg-amber-50 text-amber-700 border-amber-200' },
]

const COMPARISON_ROWS = [
  { feature: 'Medicine price discounts',   free: true,  gold: true,  goldLabel: 'Extra 10% off' },
  { feature: 'Lab test discounts',         free: true,  gold: true,  goldLabel: '20% off' },
  { feature: 'Price comparison',           free: true,  gold: true },
  { feature: 'Free delivery',             free: false, gold: true },
  { feature: 'Home sample collection',    free: false, gold: true },
  { feature: 'Priority doctor booking',   free: false, gold: true },
  { feature: 'Exclusive member coupons',  free: false, gold: true },
  { feature: 'Family coverage',           free: false, gold: false, familyOnly: true },
  { feature: 'Family health reports',     free: false, gold: false, familyOnly: true },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} className="ml-1 text-gray-400 hover:text-gray-600">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-gray-800 hover:text-brand-600"
        onClick={() => setOpen(v => !v)}
      >
        {q}
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />}
      </button>
      {open && <p className="pb-4 text-sm text-gray-500 leading-relaxed">{a}</p>}
    </div>
  )
}

export function MembershipPage() {
  const navigate = useNavigate()
  const user = authStore((s: any) => s.user)
  const accessToken = authStore((s: any) => s.accessToken)

  const [couponCode, setCouponCode] = useState('')
  const [couponResult, setCouponResult] = useState<{ discount: number; finalAmount: number } | null>(null)
  const [subscribingId, setSubscribingId] = useState<string | null>(null)
  const [subscribeError, setSubscribeError] = useState('')
  const [subscribeSuccess, setSubscribeSuccess] = useState(false)
  const [paymentPlan, setPaymentPlan] = useState<Plan | null>(null)
  const [payCard, setPayCard] = useState({ number: '', expiry: '', cvv: '', name: '' })
  const [payProcessing, setPayProcessing] = useState(false)

  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ['membership-plans'],
    queryFn: () => apiClient.get('/membership/plans').then(r => r.data),
  })

  const { data: myMembership, refetch } = useQuery<UserMembership | null>({
    queryKey: ['my-membership'],
    queryFn: () => apiClient.get('/membership/my').then(r => r.data).catch(() => null),
    enabled: !!accessToken,
  })

  const subscribeMutation = useMutation({
    mutationFn: (planId: string) => apiClient.post('/membership/subscribe', { planId }).then(r => r.data),
    onSuccess: () => {
      setSubscribeSuccess(true)
      setSubscribingId(null)
      refetch()
      setTimeout(() => setSubscribeSuccess(false), 4000)
    },
    onError: (e: any) => {
      setSubscribeError(e?.response?.data?.message ?? 'Subscription failed. Please try again.')
      setSubscribingId(null)
      setTimeout(() => setSubscribeError(''), 4000)
    },
  })

  const applyCouponMutation = useMutation({
    mutationFn: (code: string) => apiClient.post('/membership/apply-coupon', { code, amount: 500 }).then(r => r.data),
    onSuccess: (data: any) => setCouponResult(data),
    onError: () => setCouponResult(null),
  })

  const handleSubscribe = (plan: Plan) => {
    if (!accessToken) { navigate(ROUTES.login); return }
    setPaymentPlan(plan)
    setPayCard({ number: '', expiry: '', cvv: '', name: '' })
  }

  const handlePayAndSubscribe = async () => {
    if (!paymentPlan) return
    setPayProcessing(true)
    await new Promise(r => setTimeout(r, 2000))
    setPayProcessing(false)
    setPaymentPlan(null)
    setSubscribingId(paymentPlan.id)
    subscribeMutation.mutate(paymentPlan.id)
  }

  const isActive = myMembership?.status === 'active'

  const monthlyPlan = plans.find(p => p.name === 'Gold Monthly')
  const yearlyPlan  = plans.find(p => p.name === 'Gold Yearly')
  const familyPlan  = plans.find(p => p.name === 'Gold Family')

  return (
    <div className="min-h-screen bg-white">
      {/* Payment Modal */}
      {paymentPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !payProcessing && setPaymentPlan(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-brand-500" />
                <h3 className="font-bold text-gray-900">Subscribe to {paymentPlan.name}</h3>
              </div>
              <button onClick={() => setPaymentPlan(null)} disabled={payProcessing}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-center text-sm text-gray-500">
                Amount: <span className="text-lg font-bold text-brand-600">PKR {Number(paymentPlan.price).toLocaleString()}</span>
                {paymentPlan.durationDays <= 31 ? '/month' : paymentPlan.durationDays <= 92 ? '/3 months' : '/year'}
              </p>
              <input
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
                placeholder="Cardholder name"
                value={payCard.name}
                onChange={e => setPayCard(c => ({ ...c, name: e.target.value }))}
              />
              <input
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-mono tracking-widest focus:border-brand-400 focus:outline-none"
                placeholder="Card number"
                maxLength={19}
                value={payCard.number}
                onChange={e => setPayCard(c => ({ ...c, number: e.target.value.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim() }))}
              />
              <div className="flex gap-3">
                <input
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-mono focus:border-brand-400 focus:outline-none"
                  placeholder="MM/YY"
                  maxLength={5}
                  value={payCard.expiry}
                  onChange={e => { const v = e.target.value.replace(/\D/g,'').slice(0,4); setPayCard(c => ({ ...c, expiry: v.length > 2 ? `${v.slice(0,2)}/${v.slice(2)}` : v })) }}
                />
                <input
                  className="w-24 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-mono focus:border-brand-400 focus:outline-none"
                  placeholder="CVV"
                  maxLength={3}
                  value={payCard.cvv}
                  onChange={e => setPayCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g,'').slice(0,3) }))}
                />
              </div>
              <p className="flex items-center justify-center gap-1 text-[10px] text-gray-400">
                <Lock className="h-3 w-3" /> Secured · 256-bit SSL
              </p>
              <button
                onClick={handlePayAndSubscribe}
                disabled={payProcessing || !payCard.name || payCard.number.replace(/\s/g,'').length < 16 || payCard.expiry.length < 5 || payCard.cvv.length < 3}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 font-bold text-white hover:bg-brand-600 disabled:opacity-40"
              >
                {payProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : `Pay PKR ${Number(paymentPlan.price).toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold mb-6">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            Introducing Novetta Gold
          </div>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Save up to <span className="text-yellow-300">80%</span> on<br />prescriptions &amp; lab tests
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
            Compare prices, unlock exclusive discounts, and manage your family's health — all in one place.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => !accessToken ? navigate(ROUTES.login) : document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-full bg-yellow-400 px-8 py-3 text-base font-bold text-gray-900 hover:bg-yellow-300 transition-colors shadow-lg"
            >
              Get Gold — from PKR 299/mo
            </button>
            <button
              onClick={() => navigate(ROUTES.pharmacy)}
              className="rounded-full border border-white/40 px-8 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Use Free
            </button>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/20 pt-10 max-w-lg mx-auto">
            {[
              { value: '2.3M+', label: 'Members' },
              { value: '30M+', label: 'Prescriptions saved' },
              { value: 'PKR 4B+', label: 'Total savings' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-black text-yellow-300">{s.value}</p>
                <p className="text-xs text-white/70 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-center text-xl font-bold text-gray-900 mb-8">How Novetta Gold works</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: Pill,        step: '1', title: 'Search your medicine',   desc: 'Enter any medicine name or scan a prescription.' },
              { icon: BadgeCheck,  step: '2', title: 'See Gold price',         desc: 'Your Gold discount is applied automatically across all pharmacies.' },
              { icon: Truck,       step: '3', title: 'Order & get delivered',  desc: 'Show your membership at checkout or get free home delivery.' },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100">
                    <Icon className="h-7 w-7 text-brand-600" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-black text-white">{step}</span>
                </div>
                <p className="font-bold text-gray-900 text-sm">{title}</p>
                <p className="text-xs text-gray-500 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Active membership card ────────────────────────────────────────── */}
      {isActive && myMembership && (
        <section className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Your Membership</h2>
            <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white shadow-xl max-w-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-300" />
                  <span className="font-black text-sm tracking-widest">NOVETTA GOLD</span>
                </div>
                <BadgeCheck className="h-6 w-6 text-yellow-300" />
              </div>
              <p className="text-xs text-white/60 mb-0.5">Member</p>
              <p className="font-bold text-lg">{(user as any)?.name ?? 'Member'}</p>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/20 pt-4">
                <div><p className="text-[10px] text-white/50">BIN</p><p className="text-xs font-mono font-bold">610020</p></div>
                <div><p className="text-[10px] text-white/50">RxGRP</p><p className="text-xs font-mono font-bold">NVTTA</p></div>
                <div><p className="text-[10px] text-white/50">PCN</p><p className="text-xs font-mono font-bold">ADV</p></div>
              </div>
              <p className="mt-4 text-[10px] text-white/50">
                {myMembership.plan.name} · Expires {new Date(myMembership.expiresAt).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Plans ────────────────────────────────────────────────────────── */}
      <section id="plans" className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-gray-900">Choose your plan</h2>
            <p className="text-gray-500 text-sm mt-1">Cancel anytime. No hidden fees.</p>
          </div>

          {subscribeSuccess && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-5 py-4">
              <BadgeCheck className="h-5 w-5 text-green-600 shrink-0" />
              <p className="text-sm font-semibold text-green-700">Welcome to Novetta Gold! Your membership is now active.</p>
            </div>
          )}
          {subscribeError && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-5 py-4">
              <p className="text-sm text-red-700">{subscribeError}</p>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-3">
            {/* Free */}
            <div className="rounded-2xl border-2 border-gray-200 p-6 flex flex-col">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 mb-3">
                <Zap className="h-5 w-5 text-gray-500" />
              </div>
              <p className="font-black text-gray-900 text-lg">Free</p>
              <p className="text-xs text-gray-400 mt-0.5">Always free, no card needed</p>
              <div className="mt-4 mb-1">
                <span className="text-3xl font-black text-gray-900">PKR 0</span>
              </div>
              <p className="text-xs text-gray-400 mb-5">forever</p>
              <ul className="space-y-2 flex-1 mb-6">
                {['Standard pharmacy discounts', 'Price comparison', 'Lab test booking', 'Doctor appointments'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                    <Check className="h-3.5 w-3.5 shrink-0 text-green-500" /> {f}
                  </li>
                ))}
                {['Free delivery', 'Priority booking', 'Exclusive coupons'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-400">
                    <X className="h-3.5 w-3.5 shrink-0 text-gray-300" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate(ROUTES.doctors)}
                className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
              >
                Continue Free
              </button>
            </div>

            {/* Gold Monthly */}
            <div className="rounded-2xl border-2 border-brand-500 p-6 flex flex-col relative shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-4 py-1 text-[11px] font-black text-white">
                MOST POPULAR
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 mb-3">
                <Crown className="h-5 w-5 text-brand-600" />
              </div>
              <p className="font-black text-gray-900 text-lg">Gold Monthly</p>
              <p className="text-xs text-gray-400 mt-0.5">{monthlyPlan?.description ?? 'Extra savings every month'}</p>
              <div className="mt-4 mb-1 flex items-end gap-1">
                <span className="text-3xl font-black text-gray-900">PKR {monthlyPlan?.price ?? 299}</span>
              </div>
              <p className="text-xs text-gray-400 mb-5">per month · cancel anytime</p>
              <ul className="space-y-2 flex-1 mb-6">
                {(monthlyPlan?.features ?? []).map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-700">
                    <Check className="h-3.5 w-3.5 shrink-0 text-brand-500" /> {f}
                  </li>
                ))}
              </ul>
              {isActive && myMembership?.plan.name === 'Gold Monthly' ? (
                <div className="w-full rounded-xl bg-brand-50 border border-brand-200 py-2.5 text-center text-sm font-bold text-brand-600">
                  Current Plan
                </div>
              ) : (
                <button
                  onClick={() => monthlyPlan && handleSubscribe(monthlyPlan)}
                  disabled={subscribeMutation.isPending && subscribingId === monthlyPlan?.id}
                  className="w-full rounded-xl bg-brand-500 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60"
                >
                  {subscribeMutation.isPending && subscribingId === monthlyPlan?.id ? 'Processing…' : 'Get Gold Monthly'}
                </button>
              )}
            </div>

            {/* Gold Yearly */}
            <div className="rounded-2xl border-2 border-gray-200 p-6 flex flex-col">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 mb-3">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <p className="font-black text-gray-900 text-lg">Gold Yearly</p>
              <p className="text-xs text-gray-400 mt-0.5">{yearlyPlan?.description ?? 'Best value — save 2 months free'}</p>
              <div className="mt-4 mb-1 flex items-end gap-2">
                <span className="text-3xl font-black text-gray-900">PKR {yearlyPlan?.price ?? 2499}</span>
                <span className="mb-1 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700">SAVE 30%</span>
              </div>
              <p className="text-xs text-gray-400 mb-5">per year · PKR {Math.round(Number(yearlyPlan?.price ?? 2499) / 12)}/mo equivalent</p>
              <ul className="space-y-2 flex-1 mb-6">
                {(yearlyPlan?.features ?? []).map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-700">
                    <Check className="h-3.5 w-3.5 shrink-0 text-amber-500" /> {f}
                  </li>
                ))}
              </ul>
              {isActive && myMembership?.plan.name === 'Gold Yearly' ? (
                <div className="w-full rounded-xl bg-amber-50 border border-amber-200 py-2.5 text-center text-sm font-bold text-amber-600">
                  Current Plan
                </div>
              ) : (
                <button
                  onClick={() => yearlyPlan && handleSubscribe(yearlyPlan)}
                  disabled={subscribeMutation.isPending && subscribingId === yearlyPlan?.id}
                  className="w-full rounded-xl border border-amber-400 py-2.5 text-sm font-bold text-amber-600 hover:bg-amber-50 disabled:opacity-60"
                >
                  {subscribeMutation.isPending && subscribingId === yearlyPlan?.id ? 'Processing…' : 'Get Gold Yearly'}
                </button>
              )}
            </div>
          </div>

          {/* Family plan banner */}
          <div className="mt-5 rounded-2xl border border-dashed border-brand-300 bg-brand-50 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100">
                <Users className="h-6 w-6 text-brand-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Gold Family — PKR {familyPlan?.price ?? 499}/month</p>
                <p className="text-xs text-gray-500 mt-0.5">Cover up to 5 family members. Everyone gets full Gold benefits.</p>
              </div>
            </div>
            {isActive && myMembership?.plan.name === 'Gold Family' ? (
              <div className="rounded-xl bg-brand-100 px-5 py-2 text-sm font-bold text-brand-700">Current Plan</div>
            ) : (
              <button
                onClick={() => familyPlan && handleSubscribe(familyPlan)}
                disabled={subscribeMutation.isPending && subscribingId === familyPlan?.id}
                className="shrink-0 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60"
              >
                {subscribeMutation.isPending && subscribingId === familyPlan?.id ? 'Processing…' : 'Get Family Plan'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Free vs Gold comparison table ────────────────────────────────── */}
      <section className="bg-gray-50 border-t border-b border-gray-100">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-8">Free vs Gold</h2>
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Feature</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500">Free</th>
                  <th className="px-5 py-3 text-center text-xs font-bold text-brand-600 bg-brand-50">Gold</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-amber-600">Family</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {COMPARISON_ROWS.map(row => (
                  <tr key={row.feature} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-700 font-medium">{row.feature}</td>
                    <td className="px-5 py-3 text-center">
                      {row.free
                        ? <Check className="h-4 w-4 text-green-500 mx-auto" />
                        : <X className="h-4 w-4 text-gray-300 mx-auto" />}
                    </td>
                    <td className="px-5 py-3 text-center bg-brand-50/50">
                      {row.familyOnly
                        ? <X className="h-4 w-4 text-gray-300 mx-auto" />
                        : row.gold
                          ? row.goldLabel
                            ? <span className="text-xs font-bold text-brand-600">{row.goldLabel}</span>
                            : <Check className="h-4 w-4 text-brand-500 mx-auto" />
                          : <X className="h-4 w-4 text-gray-300 mx-auto" />}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {row.familyOnly || row.gold
                        ? <Check className="h-4 w-4 text-amber-500 mx-auto" />
                        : <X className="h-4 w-4 text-gray-300 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Coupons ──────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Tag className="h-8 w-8 text-brand-500 mx-auto mb-2" />
            <h2 className="text-2xl font-black text-gray-900">Discount coupons</h2>
            <p className="text-gray-500 text-sm mt-1">Available to all users — Gold members get extra exclusive codes</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 mb-8">
            {COUPONS.map(({ code, label, color }) => (
              <div
                key={code}
                className={`flex items-center justify-between rounded-xl border p-4 ${color} cursor-pointer hover:opacity-80`}
                onClick={() => setCouponCode(code)}
              >
                <div>
                  <p className="font-mono font-black text-sm tracking-widest">{code}</p>
                  <p className="text-xs mt-0.5 opacity-70">{label}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold">
                  <CopyButton text={code} />
                  Use
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">Apply a coupon code</p>
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null) }}
                onKeyDown={e => e.key === 'Enter' && couponCode && applyCouponMutation.mutate(couponCode)}
                placeholder="Enter code e.g. FIRST10"
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-mono uppercase tracking-widest focus:border-brand-400 focus:outline-none"
              />
              <button
                onClick={() => couponCode && applyCouponMutation.mutate(couponCode)}
                disabled={applyCouponMutation.isPending || !couponCode.trim()}
                className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {applyCouponMutation.isPending ? '…' : 'Apply'}
              </button>
            </div>
            {couponResult && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
                <Check className="h-4 w-4 text-green-600 shrink-0" />
                <p className="text-sm text-green-700">
                  Coupon applied! You save <strong>PKR {couponResult.discount}</strong> — Final: <strong>PKR {couponResult.finalAmount}</strong>
                </p>
              </div>
            )}
            {applyCouponMutation.isError && (
              <p className="mt-2 text-xs text-red-500">Invalid or expired coupon code.</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Benefits highlights ───────────────────────────────────────────── */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-10">Everything in one Gold membership</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Pill,         color: 'bg-blue-100 text-blue-600',   title: 'Medicine discounts',       desc: 'Extra 10% off across all pharmacies, on top of standard prices.' },
              { icon: FlaskConical, color: 'bg-green-100 text-green-600', title: '20% off lab tests',        desc: 'Book home collection with priority scheduling at discounted rates.' },
              { icon: Stethoscope, color: 'bg-purple-100 text-purple-600', title: 'Priority consultations', desc: 'Skip the queue. Gold members get priority slots with top doctors.' },
              { icon: Truck,        color: 'bg-amber-100 text-amber-600',  title: 'Free delivery',           desc: 'Free doorstep delivery on all medicine orders, no minimum.' },
              { icon: Users,        color: 'bg-rose-100 text-rose-600',    title: 'Family coverage',         desc: 'Add up to 5 family members under a single Gold Family plan.' },
              { icon: Shield,       color: 'bg-brand-100 text-brand-600',  title: 'Price guarantee',         desc: 'We guarantee the Gold price — if you find it cheaper, we match it.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} mb-3`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-bold text-gray-900 text-sm">{title}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partner pharmacies ───────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Accepted at 8,000+ pharmacies</h2>
          <p className="text-gray-500 text-sm mb-8">Show your Gold card at checkout — in-person or online.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {PARTNER_PHARMACIES.map(name => (
              <div key={name} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-8">Frequently asked questions</h2>
          <div className="rounded-2xl border border-gray-200 bg-white px-6 shadow-sm">
            {FAQS.map(({ q, a }) => <FaqItem key={q} q={q} a={a} />)}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8 text-center">
          <Crown className="h-10 w-10 text-yellow-300 mx-auto mb-4" />
          <h2 className="text-3xl font-black">Start saving today</h2>
          <p className="mt-2 text-white/80">Join 2.3 million members who save on every prescription.</p>
          <button
            onClick={() => !accessToken ? navigate(ROUTES.login) : document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-6 rounded-full bg-yellow-400 px-8 py-3 text-base font-bold text-gray-900 hover:bg-yellow-300 transition-colors shadow-lg"
          >
            Get Novetta Gold
          </button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
