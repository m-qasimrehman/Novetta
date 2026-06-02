import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  Search, ShoppingCart, Plus, Minus, Trash2, Package, X,
  CheckCircle, Tag, ScanLine, Barcode, GitCompare, Star,
  MapPin, Clock, Package2, ChevronRight, Crown, CreditCard, Loader2,
} from 'lucide-react'
import { Navbar } from '../../../components/layouts/Navbar'
import { Footer } from '../../../components/layouts/Footer'
import { pharmacyApi, membershipApi, prescriptionsApi, type Medicine, type PharmacyComparison } from '../../../lib/api'
import { authStore } from '../../auth/store/authStore'
import { ROUTES } from '../../../constants/routes'

interface CartItem { medicine: Medicine; quantity: number }

const CATEGORY_COLORS: Record<string, string> = {
  Analgesics:      'bg-red-100 text-red-700',
  Antibiotics:     'bg-yellow-100 text-yellow-700',
  Cardiovascular:  'bg-pink-100 text-pink-700',
  Gastrointestinal:'bg-orange-100 text-orange-700',
  Diabetes:        'bg-purple-100 text-purple-700',
  Respiratory:     'bg-blue-100 text-blue-700',
  Vitamins:        'bg-green-100 text-green-700',
  Dermatology:     'bg-teal-100 text-teal-700',
}

// ── Price Comparison Modal ────────────────────────────────────────────────────
type SortKey = 'price' | 'distance' | 'delivery' | 'rating' | 'savings'

function CompareModal({
  medicine,
  onClose,
  onAddToCart,
}: {
  medicine: Medicine
  onClose: () => void
  onAddToCart: (m: Medicine) => void
}) {
  const [sortBy, setSortBy] = useState<SortKey>('price')

  const { data, isLoading } = useQuery({
    queryKey: ['compare', medicine.id],
    queryFn: () => pharmacyApi.comparePrices(medicine.id).then(r => r.data),
  })
  const rawPharmacies: PharmacyComparison[] = (data as any)?.data?.pharmacies ?? []

  const pharmacies = [...rawPharmacies].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price
    if (sortBy === 'rating') return b.rating - a.rating
    if (sortBy === 'savings') return (b.price - b.memberPrice) - (a.price - a.memberPrice)
    if (sortBy === 'distance') return parseFloat(a.distance) - parseFloat(b.distance)
    if (sortBy === 'delivery') return parseInt(a.deliveryTime) - parseInt(b.deliveryTime)
    return 0
  })

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'price',    label: 'Lowest Price' },
    { key: 'distance', label: 'Nearest' },
    { key: 'delivery', label: 'Fastest' },
    { key: 'savings',  label: 'Best Savings' },
    { key: 'rating',   label: 'Top Rated' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="font-bold text-gray-900">Compare Prices</h3>
            <p className="text-xs text-gray-400">{medicine.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>

        {/* Sort controls */}
        <div className="flex gap-1.5 overflow-x-auto px-5 py-3 border-b border-gray-100">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${sortBy === opt.key ? 'bg-brand-500 text-white' : 'border border-gray-200 text-gray-600 hover:border-brand-300'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />)
          ) : (
            pharmacies.map((ph, i) => (
              <div key={ph.id} className={`rounded-xl border p-4 ${i === 0 ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}>
                {i === 0 && <span className="mb-2 inline-block rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white">BEST {SORT_OPTIONS.find(o => o.key === sortBy)?.label.toUpperCase()}</span>}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{ph.name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {ph.distance}</span>
                      <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {ph.deliveryTime}</span>
                      <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {ph.rating}</span>
                    </div>
                    {!ph.inStock && <span className="mt-1 inline-block text-xs text-red-500 font-semibold">Out of stock</span>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">PKR {ph.price.toLocaleString()}</p>
                    <p className="text-xs text-green-600">Member: PKR {ph.memberPrice.toLocaleString()}</p>
                    {sortBy === 'savings' && <p className="text-xs text-brand-600 font-semibold">Save PKR {(ph.price - ph.memberPrice).toLocaleString()}</p>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gray-100 px-5 py-4">
          <button
            onClick={() => { onAddToCart(medicine); onClose() }}
            disabled={!medicine.inStock}
            className="w-full rounded-xl bg-brand-500 py-3 font-semibold text-white disabled:opacity-40 hover:bg-brand-600"
          >
            Add Best Price to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Barcode Scanner Modal ─────────────────────────────────────────────────────
function BarcodeModal({ onClose, onFound }: { onClose: () => void; onFound: (m: Medicine) => void }) {
  const [code, setCode] = useState('')
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')

  const lookup = async () => {
    if (!code.trim()) return
    setSearching(true)
    setError('')
    try {
      const res = await pharmacyApi.lookupBarcode(code.trim())
      const med = (res.data as any)?.data?.medicine
      if (med) { onFound(med); onClose() }
    } catch {
      setError('Medicine not found for this barcode. Try another code.')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">Barcode Scanner</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400" /></button>
        </div>

        <div className="mb-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center">
          <Barcode className="mx-auto h-10 w-10 text-gray-300 mb-2" />
          <p className="text-xs text-gray-400">Enter barcode / GTIN manually</p>
        </div>

        <input
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-mono focus:border-brand-400 focus:outline-none mb-3"
          placeholder="e.g. 8901234567890"
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && lookup()}
          autoFocus
        />

        {error && <p className="mb-3 text-xs text-red-500">{error}</p>}

        <button
          onClick={lookup}
          disabled={!code.trim() || searching}
          className="w-full rounded-xl bg-brand-500 py-3 font-semibold text-white disabled:opacity-40 hover:bg-brand-600"
        >
          {searching ? 'Searching...' : 'Find Medicine'}
        </button>
      </div>
    </div>
  )
}

// ── Medicine Card ─────────────────────────────────────────────────────────────
function MedicineCard({
  medicine,
  onAdd,
  onCompare,
}: {
  medicine: Medicine
  onAdd: () => void
  onCompare: () => void
}) {
  const catColor = CATEGORY_COLORS[medicine.category ?? ''] ?? 'bg-gray-100 text-gray-600'

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow flex flex-col">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50">
        <Package className="h-7 w-7 text-brand-400" />
      </div>
      <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${catColor} w-fit`}>{medicine.category}</span>
      <h3 className="mt-2 font-bold text-gray-900 text-sm leading-tight">{medicine.name}</h3>
      {medicine.genericName && <p className="text-xs text-gray-400">{medicine.genericName}</p>}
      <p className="text-xs text-gray-500 mt-1">{medicine.unit}</p>
      <div className="mt-auto pt-3 flex items-center justify-between">
        <p className="font-bold text-brand-600">PKR {Number(medicine.price).toLocaleString()}</p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onCompare}
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1.5 text-[11px] font-semibold text-gray-600 hover:bg-gray-50"
            title="Compare prices"
          >
            <GitCompare className="h-3 w-3" /> Compare
          </button>
          <button
            onClick={onAdd}
            disabled={!medicine.inStock}
            className="flex items-center gap-1 rounded-lg bg-brand-500 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-brand-600 disabled:opacity-40"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
      </div>
      {!medicine.inStock && <p className="text-xs text-red-500 mt-1">Out of stock</p>}
    </div>
  )
}

// ── Payment Modal ─────────────────────────────────────────────────────────────
function PaymentModal({
  amount,
  onSuccess,
  onClose,
}: {
  amount: number
  onSuccess: () => void
  onClose: () => void
}) {
  const [method, setMethod] = useState<'card' | 'mada'>('card')
  const [processing, setProcessing] = useState(false)
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' })

  const pay = async () => {
    setProcessing(true)
    await new Promise(r => setTimeout(r, 2000))
    setProcessing(false)
    onSuccess()
  }

  const set = (k: string, v: string) => setCard(p => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-brand-500" />
            <h3 className="font-bold text-gray-900">Secure Payment</h3>
          </div>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400" /></button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-500 text-center">Amount due: <span className="text-lg font-bold text-brand-600">PKR {amount.toLocaleString()}</span></p>

          {/* Method selector */}
          <div className="flex gap-2">
            {([['card', 'Visa / Mastercard'], ['mada', 'Mada']] as const).map(([m, label]) => (
              <button key={m} onClick={() => setMethod(m)}
                className={`flex-1 rounded-xl border-2 py-2 text-sm font-semibold transition-all ${method === m ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Card form */}
          <div className="space-y-3">
            <input
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-mono tracking-widest focus:border-brand-400 focus:outline-none"
              placeholder="Card number"
              maxLength={19}
              value={card.number}
              onChange={e => set('number', e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
            />
            <input
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
              placeholder="Cardholder name"
              value={card.name}
              onChange={e => set('name', e.target.value)}
            />
            <div className="flex gap-3">
              <input
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-mono focus:border-brand-400 focus:outline-none"
                placeholder="MM/YY"
                maxLength={5}
                value={card.expiry}
                onChange={e => set('expiry', e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5))}
              />
              <input
                className="w-24 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-mono focus:border-brand-400 focus:outline-none"
                placeholder="CVV"
                maxLength={4}
                type="password"
                value={card.cvv}
                onChange={e => set('cvv', e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          <p className="text-[10px] text-gray-400 text-center">
            Secured by Razorpay · 256-bit SSL encryption
          </p>

          <button
            onClick={pay}
            disabled={processing || !card.number || !card.name || !card.expiry || !card.cvv}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 font-semibold text-white disabled:opacity-40 hover:bg-brand-600"
          >
            {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : `Pay PKR ${amount.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main PharmacyPage ─────────────────────────────────────────────────────────
export function PharmacyPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = authStore((s: any) => s.user)
  const prescriptionId = new URLSearchParams(location.search).get('prescriptionId')

  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery')
  const [address, setAddress] = useState('')
  const [ordered, setOrdered] = useState(false)
  const [compareTarget, setCompareTarget] = useState<Medicine | null>(null)
  const [showBarcode, setShowBarcode] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponResult, setCouponResult] = useState<{ discount: number; finalAmount: number; coupon: any } | null>(null)
  const [couponError, setCouponError] = useState('')
  const [showPayment, setShowPayment] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['medicines', search, category],
    queryFn: () => pharmacyApi.searchMedicines({ q: search || undefined, category: category || undefined }).then(r => r.data),
  })

  const { data: membershipRes } = useQuery({
    queryKey: ['my-membership'],
    queryFn: () => membershipApi.myMembership().then(r => r.data),
    enabled: !!user,
  })
  const membership = membershipRes ?? null
  const isMember = !!membership && !!membership.plan
  const discountPct: number = isMember ? (membership.plan?.discountPct ?? 0) : 0
  const hasFreeDelivery: boolean = isMember && (membership.plan?.freeDelivery ?? false)

  const medicines: Medicine[] = (data as any)?.data ?? []

  const addToCart = (medicine: Medicine) => {
    setCart(prev => {
      const existing = prev.find(i => i.medicine.id === medicine.id)
      if (existing) return prev.map(i => i.medicine.id === medicine.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { medicine, quantity: 1 }]
    })
  }

  const [rxBanner, setRxBanner] = useState<string | null>(null)
  const rxLoaded = useRef(false)

  useEffect(() => {
    if (!prescriptionId || rxLoaded.current) return
    rxLoaded.current = true
    prescriptionsApi.getOne(prescriptionId).then(res => {
      const rx = res.data?.data
      if (!rx) return
      const names = rx.items.map((i: any) => i.medicineName).filter(Boolean)
      setRxBanner(`Prescription from ${rx.doctor?.user?.name ?? 'doctor'} · ${names.length} medicine${names.length !== 1 ? 's' : ''}`)
      names.forEach((name: string) => {
        pharmacyApi.searchMedicines({ q: name }).then(r => {
          const med = ((r.data as any)?.data ?? [])[0]
          if (med) addToCart(med)
        }).catch(() => {})
      })
    }).catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prescriptionId])

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev
      .map(i => i.medicine.id === id ? { ...i, quantity: i.quantity + delta } : i)
      .filter(i => i.quantity > 0)
    )
  }

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0)
  const baseTotal = cart.reduce((s, i) => s + Number(i.medicine.price) * i.quantity, 0)
  const memberSavings = isMember ? Math.round((baseTotal * discountPct) / 100) : 0
  const afterMember = baseTotal - memberSavings
  const couponDiscount = couponResult?.discount ?? 0
  const deliveryFee = deliveryType === 'delivery' && !hasFreeDelivery ? 150 : 0
  const totalAmount = Math.max(0, afterMember - couponDiscount) + deliveryFee

  const couponMutation = useMutation({
    mutationFn: () => membershipApi.applyCoupon(couponCode.trim().toUpperCase(), afterMember),
    onSuccess: (res) => {
      const d = (res.data as any)
      setCouponResult({ discount: d.discount, finalAmount: d.finalAmount, coupon: d.coupon })
      setCouponError('')
    },
    onError: (err: any) => {
      setCouponError(err?.response?.data?.message ?? 'Invalid coupon code')
      setCouponResult(null)
    },
  })

  const orderMutation = useMutation({
    mutationFn: () => pharmacyApi.createOrder({
      items: cart.map(i => ({ medicineId: i.medicine.id, quantity: i.quantity })),
      deliveryType,
      address: deliveryType === 'delivery' ? address : undefined,
      prescriptionId: prescriptionId ?? undefined,
      couponCode: couponResult?.coupon?.code ?? undefined,
    }),
    onSuccess: () => { setOrdered(true); setCart([]) },
  })

  const CATEGORIES = ['Analgesics', 'Antibiotics', 'Cardiovascular', 'Gastrointestinal', 'Diabetes', 'Respiratory', 'Vitamins', 'Dermatology']

  if (ordered) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Order Placed!</h2>
          <p className="text-gray-500 mt-2">Your medicine order has been placed successfully.</p>
          <div className="mt-8 flex gap-3 justify-center">
            <button onClick={() => navigate(ROUTES.pharmacyOrders)} className="flex items-center gap-2 rounded-xl bg-brand-500 py-3 px-5 font-semibold text-white hover:bg-brand-600">
              <Package2 className="h-4 w-4" /> Track Order
            </button>
            <button onClick={() => setOrdered(false)} className="rounded-xl border border-gray-200 py-3 px-5 font-semibold text-gray-700 hover:bg-gray-50">
              Shop More
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {compareTarget && (
        <CompareModal medicine={compareTarget} onClose={() => setCompareTarget(null)} onAddToCart={addToCart} />
      )}
      {showBarcode && (
        <BarcodeModal onClose={() => setShowBarcode(false)} onFound={med => { addToCart(med); setShowBarcode(false) }} />
      )}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Prescription auto-cart banner */}
        {rxBanner && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-brand-700">
              <CheckCircle className="h-4 w-4 shrink-0 text-brand-500" />
              <span><span className="font-semibold">Prescription loaded:</span> {rxBanner} — matching medicines added to cart</span>
            </div>
            <button onClick={() => setRxBanner(null)} className="text-brand-400 hover:text-brand-600"><X className="h-4 w-4" /></button>
          </div>
        )}

        {/* Header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pharmacy</h1>
            <p className="text-sm text-gray-500 mt-0.5">Search, compare and order medicines online</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate(ROUTES.pharmacyScan)}
              className="flex items-center gap-1.5 rounded-xl border border-brand-300 px-3.5 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50"
            >
              <ScanLine className="h-4 w-4" /> Scan Rx
            </button>
            <button
              onClick={() => setShowBarcode(true)}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              <Barcode className="h-4 w-4" /> Barcode
            </button>
            <button
              onClick={() => navigate(ROUTES.pharmacyOrders)}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              <Package2 className="h-4 w-4" /> My Orders
            </button>
            <button
              onClick={() => setShowCart(true)}
              className="relative flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 font-semibold text-white hover:bg-brand-600"
            >
              <ShoppingCart className="h-5 w-5" />
              Cart
              {totalItems > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {prescriptionId && (
          <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50 p-3 flex items-center gap-2 text-sm text-brand-700">
            <Tag className="h-4 w-4 shrink-0" /> Linked to prescription. Add medicines from your prescription below.
          </div>
        )}

        {/* Tele-pharmacist CTA */}
        <div
          onClick={() => navigate(ROUTES.telePharmacist)}
          className="mb-5 cursor-pointer rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
        >
          <div>
            <p className="font-semibold text-purple-800">Not sure what to buy?</p>
            <p className="text-xs text-purple-600">Chat with a pharmacist for OTC medicine guidance</p>
          </div>
          <ChevronRight className="h-5 w-5 text-purple-400" />
        </div>

        {/* Search */}
        <form className="mb-4 flex gap-2" onSubmit={e => { e.preventDefault(); setSearch(q) }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-400 focus:outline-none"
              placeholder="Search medicines by name or generic..."
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
          <button type="submit" className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">Search</button>
        </form>

        {/* Category filters */}
        <div className="mb-5 flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('')}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${!category ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
          >
            All
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c === category ? '' : c)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${category === c ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-52 animate-pulse rounded-xl bg-gray-200" />)}
          </div>
        ) : medicines.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="mx-auto h-10 w-10 text-gray-300 mb-2" />
            <p className="text-gray-400">No medicines found</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {medicines.map(med => (
              <MedicineCard
                key={med.id}
                medicine={med}
                onAdd={() => addToCart(med)}
                onCompare={() => setCompareTarget(med)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          amount={totalAmount}
          onClose={() => setShowPayment(false)}
          onSuccess={() => { setShowPayment(false); orderMutation.mutate() }}
        />
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setShowCart(false)} />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-brand-500" /> Cart ({totalItems})</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>

            {/* Member badge */}
            {isMember && (
              <div className="flex items-center gap-2 bg-indigo-50 px-5 py-2.5 text-xs font-semibold text-indigo-700 border-b border-indigo-100">
                <Crown className="h-3.5 w-3.5" />
                {membership.plan?.name} active — {discountPct}% off applied
                {hasFreeDelivery && <span className="ml-auto text-green-600">Free delivery</span>}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {cart.length === 0 ? (
                <p className="text-gray-400 text-center py-10">Your cart is empty</p>
              ) : cart.map(item => {
                const lineBase = Number(item.medicine.price) * item.quantity
                const lineMember = isMember ? Math.round(lineBase * (1 - discountPct / 100)) : lineBase
                return (
                  <div key={item.medicine.id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                      <Package className="h-5 w-5 text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.medicine.name}</p>
                      <div className="flex items-center gap-1.5">
                        {isMember && <p className="text-xs text-gray-400 line-through">PKR {lineBase.toLocaleString()}</p>}
                        <p className="text-xs font-semibold text-brand-600">PKR {lineMember.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQty(item.medicine.id, -1)} className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQty(item.medicine.id, 1)} className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50">
                        <Plus className="h-3 w-3" />
                      </button>
                      <button onClick={() => setCart(prev => prev.filter(i => i.medicine.id !== item.medicine.id))} className="ml-1 text-red-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                {/* Delivery type */}
                <div className="flex gap-2">
                  {(['delivery', 'pickup'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setDeliveryType(type)}
                      className={`flex-1 rounded-xl border-2 py-2 text-sm font-semibold capitalize transition-all ${deliveryType === type ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600'}`}
                    >
                      {type === 'delivery' ? `Delivery${hasFreeDelivery ? ' (Free)' : ' +PKR 150'}` : 'Pickup'}
                    </button>
                  ))}
                </div>

                {deliveryType === 'delivery' && (
                  <input
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
                    placeholder="Delivery address..."
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                )}

                {/* Coupon input */}
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                      <input
                        className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm font-mono uppercase focus:border-brand-400 focus:outline-none"
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); setCouponError('') }}
                        disabled={!!couponResult}
                      />
                    </div>
                    {couponResult ? (
                      <button onClick={() => { setCouponResult(null); setCouponCode('') }} className="rounded-xl border border-red-200 px-3 text-xs text-red-500 hover:bg-red-50">
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => couponMutation.mutate()}
                        disabled={!couponCode.trim() || couponMutation.isPending}
                        className="rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white disabled:opacity-40 hover:bg-brand-600"
                      >
                        {couponMutation.isPending ? '…' : 'Apply'}
                      </button>
                    )}
                  </div>
                  {couponResult && (
                    <p className="text-xs font-semibold text-green-600">
                      Coupon applied — PKR {couponResult.discount.toLocaleString()} off!
                    </p>
                  )}
                  {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                </div>

                {/* Price breakdown */}
                <div className="space-y-1.5 rounded-xl bg-gray-50 px-4 py-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span><span>PKR {baseTotal.toLocaleString()}</span>
                  </div>
                  {isMember && memberSavings > 0 && (
                    <div className="flex justify-between text-indigo-600">
                      <span>Member discount ({discountPct}%)</span><span>−PKR {memberSavings.toLocaleString()}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon ({couponResult?.coupon?.code})</span><span>−PKR {couponDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  {deliveryType === 'delivery' && (
                    <div className={`flex justify-between ${hasFreeDelivery ? 'text-green-600' : 'text-gray-600'}`}>
                      <span>Delivery</span><span>{hasFreeDelivery ? 'Free' : 'PKR 150'}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold text-gray-900">
                    <span>Total</span><span className="text-brand-600">PKR {totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {orderMutation.isError && (
                  <p className="text-xs text-red-500">{(orderMutation.error as any)?.response?.data?.message || 'Order failed'}</p>
                )}

                <button
                  onClick={() => setShowPayment(true)}
                  disabled={orderMutation.isPending || (deliveryType === 'delivery' && !address)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 font-semibold text-white disabled:opacity-40 hover:bg-brand-600"
                >
                  <CreditCard className="h-4 w-4" />
                  {orderMutation.isPending ? 'Placing order…' : 'Pay & Place Order'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
