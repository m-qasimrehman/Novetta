import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ChevronLeft, Video, Building2, Home, AlertCircle, CreditCard, Loader2, Lock } from 'lucide-react'
import { Navbar } from '../../../components/layouts/Navbar'
import { Footer } from '../../../components/layouts/Footer'
import { doctorsApi, appointmentsApi, type TimeSlot } from '../../../lib/api'
import { ROUTES } from '../../../constants/routes'

type ConsultationType = 'telehealth' | 'in-clinic' | 'home-visit'

const CONSULTATION_OPTIONS = [
  { value: 'telehealth' as ConsultationType, label: 'Telehealth', icon: Video, desc: 'Video call from home', color: 'border-blue-300 bg-blue-50 text-blue-700' },
  { value: 'in-clinic' as ConsultationType, label: 'In Clinic', icon: Building2, desc: 'Visit doctor in person', color: 'border-green-300 bg-green-50 text-green-700' },
  { value: 'home-visit' as ConsultationType, label: 'Home Visit', icon: Home, desc: 'Doctor visits your home', color: 'border-purple-300 bg-purple-50 text-purple-700' },
]

function getNext7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i + 1)
    return d
  })
}

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function AppointmentBookingPage() {
  const { doctorId } = useParams<{ doctorId: string }>()
  const navigate = useNavigate()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [consultationType, setConsultationType] = useState<ConsultationType | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [reason, setReason] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [paying, setPaying] = useState(false)
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' })

  const days = getNext7Days()

  const { data: doctorData } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: () => doctorsApi.getOne(doctorId!).then(r => r.data as any),
    enabled: !!doctorId,
  })

  const dateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : ''
  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ['availability', doctorId, dateStr],
    queryFn: () => doctorsApi.getAvailability(doctorId!, dateStr).then(r => r.data as any),
    enabled: !!doctorId && !!dateStr,
  })

  const slots: TimeSlot[] = slotsData?.slots ?? []

  const bookMutation = useMutation({
    mutationFn: async () => {
      const appointmentDate = new Date(selectedDate!)
      const [h, m] = selectedSlot!.time.split(':').map(Number)
      appointmentDate.setHours(h, m, 0, 0)
      const res = await appointmentsApi.book({
        doctorId: doctorId!,
        slotId: selectedSlot!.slotId,
        appointmentDate: appointmentDate.toISOString(),
        consultationType: consultationType!,
        reason: reason || undefined,
      })
      return (res.data as any)?.data
    },
    onSuccess: (appt) => {
      navigate(ROUTES.appointmentConfirmation(appt?.id), { state: { appointment: appt } })
    },
  })

  const doctor = doctorData
  const fee = doctor?.consultationFee ? `PKR ${Number(doctor.consultationFee).toLocaleString()}` : 'To be determined'

  const availableTypes = (doctor?.consultationTypes ?? []) as ConsultationType[]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-brand-500">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="text-xl font-bold text-gray-900 mb-1">Book Appointment</h1>
        {doctor && (
          <p className="text-sm text-gray-500 mb-6">with {doctor.user?.name} · {doctor.specialization}</p>
        )}

        {/* Steps */}
        <div className="mb-8 flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step >= s ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {s}
              </div>
              {s < 3 && <div className={`h-0.5 w-12 ${step > s ? 'bg-brand-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
          <div className="ml-2 text-sm text-gray-500">
            {step === 1 && 'Choose type & date'}
            {step === 2 && 'Select time slot'}
            {step === 3 && 'Confirm booking'}
          </div>
        </div>

        {/* Step 1: Type + Date */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-3 font-semibold text-gray-800">Consultation Type</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {CONSULTATION_OPTIONS.filter(o => availableTypes.includes(o.value) || availableTypes.length === 0).map(opt => {
                  const Icon = opt.icon
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setConsultationType(opt.value)}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${consultationType === opt.value ? opt.color + ' border-2' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="font-semibold text-sm">{opt.label}</span>
                      <span className="text-xs opacity-70">{opt.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <h2 className="mb-3 font-semibold text-gray-800">Select Date</h2>
              <div className="grid grid-cols-7 gap-1.5">
                {days.map(day => (
                  <button
                    key={day.toISOString()}
                    onClick={() => { setSelectedDate(day); setSelectedSlot(null) }}
                    className={`flex flex-col items-center rounded-xl p-2.5 border-2 transition-all ${selectedDate?.toDateString() === day.toDateString() ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <span className="text-xs text-gray-500">{DAY_SHORT[day.getDay()]}</span>
                    <span className="text-lg font-bold">{day.getDate()}</span>
                    <span className="text-[10px] text-gray-400">{MONTH_SHORT[day.getMonth()]}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={!consultationType || !selectedDate}
              onClick={() => setStep(2)}
              className="w-full rounded-xl bg-brand-500 py-3 font-semibold text-white disabled:opacity-40 hover:bg-brand-600"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Time slot */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-1 font-semibold text-gray-800">Available Times</h2>
              <p className="text-sm text-gray-500 mb-4">
                {selectedDate ? `${DAY_SHORT[selectedDate.getDay()]}, ${selectedDate.getDate()} ${MONTH_SHORT[selectedDate.getMonth()]}` : ''}
              </p>

              {slotsLoading ? (
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-200" />)}
                </div>
              ) : slots.length === 0 ? (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
                  <AlertCircle className="mx-auto h-8 w-8 text-amber-400 mb-2" />
                  <p className="text-sm font-medium text-amber-700">No slots available for this day</p>
                  <button className="mt-2 text-xs text-brand-500 hover:underline" onClick={() => setStep(1)}>Choose another date</button>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slots.map(slot => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-lg border py-2.5 text-sm font-semibold transition-all ${
                        !slot.available
                          ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                          : selectedSlot?.time === slot.time
                          ? 'border-brand-500 bg-brand-500 text-white'
                          : 'border-gray-200 bg-white hover:border-brand-300 text-gray-700'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Reason for visit (optional)</label>
              <textarea
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm resize-none focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200"
                rows={3}
                placeholder="Describe your symptoms or reason for the appointment..."
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 rounded-xl border border-gray-200 py-3 font-semibold text-gray-700 hover:bg-gray-50">
                Back
              </button>
              <button
                disabled={!selectedSlot}
                onClick={() => setStep(3)}
                className="flex-1 rounded-xl bg-brand-500 py-3 font-semibold text-white disabled:opacity-40 hover:bg-brand-600"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-800">Confirm Booking</h2>

            <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600 font-bold">
                  {doctor?.user?.name.split(' ').filter((_: any, i: number) => i > 0).map((p: string) => p[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{doctor?.user?.name}</p>
                  <p className="text-sm text-gray-500">{doctor?.specialization}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium capitalize text-gray-800">{consultationType?.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium text-gray-800">
                    {selectedDate ? `${DAY_SHORT[selectedDate.getDay()]}, ${selectedDate.getDate()} ${MONTH_SHORT[selectedDate.getMonth()]}` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time</span>
                  <span className="font-medium text-gray-800">{selectedSlot?.time}</span>
                </div>
                {reason && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reason</span>
                    <span className="font-medium text-gray-800 max-w-[60%] text-right">{reason}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-100 pt-2 text-base">
                  <span className="font-semibold text-gray-700">Consultation Fee</span>
                  <span className="font-bold text-brand-600">{fee}</span>
                </div>
              </div>
            </div>

            {/* Payment form */}
            {showPayment ? (
              <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="h-5 w-5 text-brand-500" />
                  <h3 className="font-semibold text-gray-800">Payment Details</h3>
                  <span className="ml-auto flex items-center gap-1 text-xs text-gray-400"><Lock className="h-3 w-3" /> Secure</span>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Cardholder Name</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200"
                    placeholder="Name on card"
                    value={card.name}
                    onChange={e => setCard(c => ({ ...c, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Card Number</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    value={card.number}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 16)
                      setCard(c => ({ ...c, number: v.replace(/(.{4})/g, '$1 ').trim() }))
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Expiry</label>
                    <input
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={card.expiry}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                        setCard(c => ({ ...c, expiry: v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v }))
                      }}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">CVV</label>
                    <input
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200"
                      placeholder="123"
                      maxLength={3}
                      value={card.cvv}
                      onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                    />
                  </div>
                </div>

                {bookMutation.isError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                    {(bookMutation.error as any)?.response?.data?.message || 'Booking failed. Please try again.'}
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button onClick={() => setShowPayment(false)} className="flex-1 rounded-xl border border-gray-200 py-3 font-semibold text-gray-700 hover:bg-gray-50">
                    Back
                  </button>
                  <button
                    disabled={paying || !card.name || card.number.replace(/\s/g, '').length < 16 || card.expiry.length < 5 || card.cvv.length < 3}
                    onClick={async () => {
                      setPaying(true)
                      await new Promise(r => setTimeout(r, 2000))
                      setPaying(false)
                      bookMutation.mutate()
                    }}
                    className="flex-1 rounded-xl bg-brand-500 py-3 font-semibold text-white disabled:opacity-40 hover:bg-brand-600 flex items-center justify-center gap-2"
                  >
                    {paying ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : `Pay ${fee}`}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {bookMutation.isError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                    {(bookMutation.error as any)?.response?.data?.message || 'Booking failed. Please try again.'}
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 rounded-xl border border-gray-200 py-3 font-semibold text-gray-700 hover:bg-gray-50">
                    Back
                  </button>
                  <button
                    onClick={() => setShowPayment(true)}
                    className="flex-1 rounded-xl bg-brand-500 py-3 font-semibold text-white hover:bg-brand-600"
                  >
                    Confirm & Pay
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
