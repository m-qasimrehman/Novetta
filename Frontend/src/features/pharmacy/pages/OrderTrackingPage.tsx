import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle, Clock, MapPin, Phone, Star, Package,
  ChevronLeft, Home, Store, Bike, Pill, KeyRound, RefreshCw,
} from 'lucide-react'
import { Navbar } from '../../../components/layouts/Navbar'
import { Footer } from '../../../components/layouts/Footer'
import { pharmacyApi, type TrackingStep } from '../../../lib/api'
import { ROUTES } from '../../../constants/routes'

const STEP_ICONS: Record<string, any> = {
  placed:     CheckCircle,
  confirmed:  Store,
  preparing:  Pill,
  picked_up:  Bike,
  delivered:  Home,
}

const STATUS_LABEL: Record<string, string> = {
  pending:    'Pending',
  confirmed:  'Confirmed',
  preparing:  'Preparing',
  on_the_way: 'On the Way',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
}

export function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [otpInput, setOtpInput] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null)

  const genOtpMut = useMutation({
    mutationFn: () => pharmacyApi.generateDeliveryOtp(id!),
    onSuccess: (res: any) => setGeneratedOtp(res.data?.data?.otp ?? null),
  })

  const confirmMut = useMutation({
    mutationFn: () => pharmacyApi.confirmDelivery(id!, otpInput),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['order-tracking', id] }); setGeneratedOtp(null); setOtpInput('') },
  })

  const { data, isLoading } = useQuery({
    queryKey: ['order-tracking', id],
    queryFn: () => pharmacyApi.getOrderTracking(id!).then(r => r.data),
    refetchInterval: 30000, // Poll every 30s for updates
    enabled: !!id,
  })

  const tracking = (data as any)?.data

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="mx-auto max-w-lg px-4 py-6">
          <div className="space-y-4">
            <div className="h-12 animate-pulse rounded-xl bg-gray-200" />
            <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
            <div className="h-40 animate-pulse rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
    )
  }

  if (!tracking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="py-20 text-center">
          <p className="text-gray-400">Order not found</p>
        </div>
      </div>
    )
  }

  const { order, tracking: track } = tracking
  const eta = new Date(track.estimatedDelivery)
  const now = new Date()
  const isDelivered = order.status === 'delivered'
  const minutesLeft = Math.max(0, Math.round((eta.getTime() - now.getTime()) / 60000))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-lg px-4 py-6 sm:px-6">
        {/* Back */}
        <button
          onClick={() => navigate(ROUTES.pharmacyOrders)}
          className="mb-4 flex items-center gap-1.5 text-sm text-brand-500 hover:underline"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Orders
        </button>

        {/* Status Banner */}
        <div className={`rounded-2xl p-5 mb-5 text-white ${isDelivered ? 'bg-green-500' : 'bg-brand-500'}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold opacity-80">Order Status</p>
            <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold">
              {STATUS_LABEL[order.status] ?? order.status}
            </span>
          </div>
          {isDelivered ? (
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8" />
              <div>
                <p className="text-lg font-bold">Delivered!</p>
                <p className="text-sm opacity-80">Your order has been delivered</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8" />
              <div>
                <p className="text-lg font-bold">{minutesLeft > 0 ? `~${minutesLeft} min` : 'Arriving soon'}</p>
                <p className="text-sm opacity-80">Estimated delivery</p>
              </div>
            </div>
          )}
        </div>

        {/* Tracking Timeline */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 mb-5">
          <h3 className="font-bold text-gray-900 mb-4">Order Progress</h3>
          <div className="space-y-1">
            {track.steps.map((step: TrackingStep, i: number) => {
              const Icon = STEP_ICONS[step.id] ?? CheckCircle
              const isLast = i === track.steps.length - 1
              const isCurrent = i === track.currentStep - 1

              return (
                <div key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${step.done ? 'border-brand-500 bg-brand-500 text-white' : isCurrent ? 'border-brand-400 bg-brand-50 text-brand-500' : 'border-gray-200 bg-white text-gray-300'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {!isLast && <div className={`w-0.5 flex-1 my-1 ${step.done ? 'bg-brand-300' : 'bg-gray-200'}`} style={{ minHeight: '24px' }} />}
                  </div>
                  <div className="pb-5 flex-1">
                    <p className={`font-semibold text-sm ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                    {step.completedAt && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(step.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                    {!step.done && isCurrent && (
                      <p className="text-xs text-brand-500 font-semibold mt-0.5">In progress...</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Rider Info */}
        {track.rider && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 mb-5">
            <h3 className="font-bold text-gray-900 mb-3">Your Rider</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-600 text-lg">
                  {track.rider.name.split(' ').map((p: string) => p[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{track.rider.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs text-gray-500">{track.rider.rating} rating</span>
                  </div>
                </div>
              </div>
              <a
                href={`tel:${track.rider.phone}`}
                className="flex items-center gap-2 rounded-xl border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50"
              >
                <Phone className="h-4 w-4" /> Call
              </a>
            </div>
          </div>
        )}

        {/* Delivery OTP */}
        {order.deliveryType === 'delivery' && !isDelivered && (
          <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <KeyRound className="h-5 w-5 text-brand-500" />
              <h3 className="font-bold text-gray-900">Confirm Delivery</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              When your rider arrives, generate a one-time PIN and share it with them to confirm delivery.
            </p>
            {generatedOtp ? (
              <div className="mb-4 rounded-xl bg-white border border-brand-300 p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Share this PIN with your rider</p>
                <p className="text-4xl font-black tracking-widest text-brand-600">{generatedOtp}</p>
                <p className="text-xs text-gray-400 mt-1">Valid for this delivery only</p>
              </div>
            ) : (
              <button
                onClick={() => genOtpMut.mutate()}
                disabled={genOtpMut.isPending}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${genOtpMut.isPending ? 'animate-spin' : ''}`} />
                {genOtpMut.isPending ? 'Generating…' : 'Generate Delivery PIN'}
              </button>
            )}
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-center font-mono tracking-widest focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200"
                placeholder="Enter rider's PIN"
                maxLength={4}
                value={otpInput}
                onChange={e => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
              />
              <button
                disabled={otpInput.length < 4 || confirmMut.isPending}
                onClick={() => confirmMut.mutate()}
                className="rounded-xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-40"
              >
                {confirmMut.isPending ? 'Verifying…' : 'Confirm'}
              </button>
            </div>
            {confirmMut.isError && (
              <p className="mt-2 text-xs text-red-500 text-center">
                {(confirmMut.error as any)?.response?.data?.message ?? 'Invalid PIN. Try again.'}
              </p>
            )}
          </div>
        )}

        {/* Order Items */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 mb-5">
          <h3 className="font-bold text-gray-900 mb-3">Order Items</h3>
          <div className="space-y-2.5">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                    <Package className="h-4 w-4 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.medicine?.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-brand-600">PKR {(Number(item.price) * item.quantity).toLocaleString()}</p>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-brand-600">PKR {Number(order.totalAmount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        {order.deliveryType === 'delivery' && order.address && (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 flex items-start gap-3">
            <MapPin className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-0.5">Delivery Address</p>
              <p className="text-sm text-gray-800">{order.address}</p>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
