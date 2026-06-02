import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Star, MapPin, Clock, Video, Building2, Home, Globe, Award, ChevronLeft, Calendar, MessageSquare, Send, X, AlertCircle, WifiOff } from 'lucide-react'
import { Navbar } from '../../../components/layouts/Navbar'
import { Footer } from '../../../components/layouts/Footer'
import { doctorsApi, chatApi, type Doctor } from '../../../lib/api'
import { authStore } from '../../auth/store/authStore'
import { ROUTES } from '../../../constants/routes'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// ── Chat Panel ────────────────────────────────────────────────────────────────
function ChatPanel({ doctorUserId, doctorName, isOnline, onClose }: {
  doctorUserId: string; doctorName: string; isOnline: boolean; onClose: () => void
}) {
  const qc = useQueryClient()
  const accessToken = authStore((s: any) => s.accessToken)
  const [msg, setMsg] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: convo, isLoading } = useQuery({
    queryKey: ['chat', doctorUserId],
    queryFn: () => chatApi.getConversation(doctorUserId).then(r => r.data.data),
    enabled: !!accessToken,
    refetchInterval: 5000,
  })

  const { data: limitData } = useQuery({
    queryKey: ['chat-limit', doctorUserId],
    queryFn: () => chatApi.getLimit(doctorUserId).then(r => r.data.data),
    enabled: !!accessToken,
    refetchInterval: 10000,
  })

  const sendMut = useMutation({
    mutationFn: () => chatApi.send(doctorUserId, msg),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat', doctorUserId] })
      qc.invalidateQueries({ queryKey: ['chat-limit', doctorUserId] })
      setMsg('')
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [convo])

  const messages: any[] = convo ?? []
  const remaining = limitData ? (limitData.hasActiveAppt ? null : Math.max(0, limitData.limit - limitData.count)) : null
  const blocked = remaining !== null && remaining === 0

  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-80 flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 rounded-t-2xl bg-brand-500 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-white text-sm font-bold">
          {doctorName.split(' ').filter((_, i) => i > 0).map(p => p[0]).join('').slice(0, 2) || 'DR'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{doctorName}</p>
          <p className={`text-xs flex items-center gap-1 ${isOnline ? 'text-green-200' : 'text-white/60'}`}>
            {isOnline ? <><span className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" />Online</> : <><WifiOff className="h-3 w-3" />Offline</>}
          </p>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white"><X className="h-4 w-4" /></button>
      </div>

      {/* Guardrail notice */}
      {!accessToken && (
        <div className="flex items-center gap-2 bg-amber-50 px-4 py-2.5 text-xs text-amber-700 border-b border-amber-100">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>Sign in to chat with this doctor</span>
        </div>
      )}
      {accessToken && remaining !== null && (
        <div className={`flex items-center gap-2 px-4 py-2 text-xs border-b ${blocked ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {blocked
            ? 'Free limit reached (3/48 h). Book an appointment to continue.'
            : `${remaining} free message${remaining === 1 ? '' : 's'} remaining (48 h window)`}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 p-3 max-h-64 min-h-[8rem]">
        {isLoading ? (
          <p className="text-center text-xs text-gray-400 py-4">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-6">
            {isOnline ? 'Doctor is online — start your conversation' : 'Doctor is offline — they will reply when available'}
          </p>
        ) : messages.map((m: any) => (
          <div key={m.id} className={`flex ${m.isMine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.isMine ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
              {m.message}
              <p className={`mt-0.5 text-right text-[10px] ${m.isMine ? 'text-brand-200' : 'text-gray-400'}`}>
                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-3">
        {!accessToken ? (
          <p className="text-center text-xs text-gray-400">Please sign in to send messages</p>
        ) : (
          <div className="flex gap-2">
            <input
              value={msg}
              onChange={e => setMsg(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && msg.trim() && !blocked) { sendMut.mutate(); e.preventDefault() } }}
              placeholder={blocked ? 'Limit reached' : 'Type a message…'}
              disabled={blocked}
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
            />
            <button
              onClick={() => { if (msg.trim() && !blocked) sendMut.mutate() }}
              disabled={!msg.trim() || blocked || sendMut.isPending}
              className="rounded-xl bg-brand-500 p-2.5 text-white hover:bg-brand-600 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const TYPE_LABELS: Record<string, { label: string; icon: typeof Video; color: string }> = {
  telehealth: { label: 'Telehealth', icon: Video, color: 'text-blue-600 bg-blue-50' },
  'in-clinic': { label: 'In Clinic', icon: Building2, color: 'text-green-600 bg-green-50' },
  'home-visit': { label: 'Home Visit', icon: Home, color: 'text-purple-600 bg-purple-50' },
}

export function DoctorProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const user = authStore((s: any) => s.user)
  const initialTab = new URLSearchParams(window.location.search).get('tab') as 'reviews' | null
  const [activeTab, setActiveTab] = useState<'about' | 'availability' | 'reviews'>(initialTab === 'reviews' ? 'reviews' : 'about')
  const [showChat, setShowChat] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewHover, setReviewHover] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['doctor', id],
    queryFn: () => doctorsApi.getOne(id!).then(r => r.data as unknown as Doctor),
    enabled: !!id,
  })

  const reviewMut = useMutation({
    mutationFn: () => doctorsApi.addReview(id!, { rating: reviewRating, comment: reviewComment || undefined }),
    onSuccess: () => {
      setReviewSubmitted(true)
      setReviewRating(0)
      setReviewComment('')
      qc.invalidateQueries({ queryKey: ['doctor', id] })
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const doctor = data
  const fee = doctor.consultationFee ? `PKR ${Number(doctor.consultationFee).toLocaleString()}` : 'Not listed'

  // Group availability slots by day
  const slotsByDay: Record<number, typeof doctor.availabilitySlots> = {}
  ;(doctor.availabilitySlots ?? []).forEach(slot => {
    if (!slotsByDay[slot.dayOfWeek]) slotsByDay[slot.dayOfWeek] = []
    slotsByDay[slot.dayOfWeek]!.push(slot)
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-brand-500"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Doctors
        </button>

        {/* Profile card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row">
            {/* Avatar */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-3xl font-bold">
              {doctor.user.name.split(' ').filter((_, i) => i > 0).map(p => p[0]).join('').slice(0, 2)}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{doctor.user.name}</h1>
                  <p className="text-brand-600 font-semibold">{doctor.specialization}</p>
                  <p className="text-sm text-gray-500">{doctor.qualification}</p>
                </div>
                {doctor.isOnline && (
                  <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-600">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Available Now
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="mt-4 flex flex-wrap gap-5">
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-gray-900">{Number(doctor.rating).toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-gray-500">{doctor.totalReviews} reviews</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900">{doctor.experience}+</p>
                  <p className="text-xs text-gray-500">Years exp.</p>
                </div>
                {doctor.city && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="h-4 w-4 text-brand-400" />
                    <span className="text-sm">{doctor.location || doctor.city}</span>
                  </div>
                )}
              </div>

              {/* Consultation types */}
              <div className="mt-3 flex flex-wrap gap-2">
                {doctor.consultationTypes.map(type => {
                  const ct = TYPE_LABELS[type]
                  if (!ct) return null
                  const Icon = ct.icon
                  return (
                    <span key={type} className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${ct.color}`}>
                      <Icon className="h-3.5 w-3.5" /> {ct.label}
                    </span>
                  )
                })}
              </div>

              {/* Languages */}
              {doctor.languages.length > 0 && (
                <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                  <Globe className="h-3.5 w-3.5" />
                  <span>Speaks: {doctor.languages.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Fee + Book */}
          <div className="mt-6 flex flex-col gap-3 rounded-xl bg-brand-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-gray-500">Consultation fee</p>
              <p className="text-2xl font-bold text-brand-600">{fee}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowChat(v => !v)}
                className={`flex items-center justify-center gap-2 rounded-lg border px-5 py-3 font-semibold transition-colors ${showChat ? 'border-brand-400 bg-brand-100 text-brand-700' : 'border-brand-200 bg-white text-brand-600 hover:bg-brand-50'}`}
              >
                <MessageSquare className="h-4 w-4" /> Chat
              </button>
              <button
                onClick={() => navigate(ROUTES.bookAppointment(doctor.id))}
                className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600"
              >
                <Calendar className="h-5 w-5" /> Book
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          {(['about', 'availability', 'reviews'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold capitalize transition-all ${activeTab === tab ? 'bg-brand-500 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {activeTab === 'about' && (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-900">About</h2>
              <p className="text-gray-600 leading-relaxed">{doctor.about || 'No description provided.'}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                  <Award className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Qualifications</p>
                    <p className="text-sm font-medium text-gray-800">{doctor.qualification || '—'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                  <Clock className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Experience</p>
                    <p className="text-sm font-medium text-gray-800">{doctor.experience} years</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="space-y-3">
              <h2 className="font-bold text-gray-900">Weekly Availability</h2>
              {Object.keys(slotsByDay).length === 0 ? (
                <p className="text-gray-400">No availability set.</p>
              ) : (
                Object.entries(slotsByDay)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([day, slots]) => (
                    <div key={day} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                      <span className="font-semibold text-gray-700 w-28">{DAY_NAMES[Number(day)]}</span>
                      <div className="flex flex-wrap gap-2">
                        {slots!.map(slot => (
                          <span key={slot.id} className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
                            {slot.startTime} – {slot.endTime}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
              )}
              <p className="text-xs text-gray-400">Each session is 30 minutes. Book to reserve your slot.</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-5">
              {/* Rating summary */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-black text-gray-900">{Number(doctor.rating).toFixed(1)}</p>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star key={n} className={`h-4 w-4 ${n <= Math.round(Number(doctor.rating)) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{doctor.totalReviews} reviews</p>
                </div>
              </div>

              {/* Write a review — only for logged-in patients */}
              {user && (user as any).role === 'patient' && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                  <p className="text-sm font-semibold text-gray-800">Leave a Review</p>

                  {reviewSubmitted ? (
                    <p className="text-sm text-green-600 font-medium">Thank you for your review!</p>
                  ) : (
                    <>
                      {/* Star picker */}
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button
                            key={n}
                            onMouseEnter={() => setReviewHover(n)}
                            onMouseLeave={() => setReviewHover(0)}
                            onClick={() => setReviewRating(n)}
                          >
                            <Star className={`h-6 w-6 transition-colors ${n <= (reviewHover || reviewRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                          </button>
                        ))}
                        {reviewRating > 0 && <span className="ml-2 text-sm text-gray-500">{reviewRating}/5</span>}
                      </div>

                      <textarea
                        rows={3}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                        placeholder="Share your experience (optional)..."
                        value={reviewComment}
                        onChange={e => setReviewComment(e.target.value)}
                      />

                      {reviewMut.isError && (
                        <p className="text-xs text-red-500">{(reviewMut.error as any)?.response?.data?.message ?? 'Failed to submit review'}</p>
                      )}

                      <button
                        onClick={() => reviewMut.mutate()}
                        disabled={reviewRating === 0 || reviewMut.isPending}
                        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 hover:bg-brand-600"
                      >
                        {reviewMut.isPending ? 'Submitting…' : 'Submit Review'}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Existing reviews */}
              {(doctor.reviews ?? []).length === 0 ? (
                <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
              ) : (
                (doctor.reviews ?? []).map(review => (
                  <div key={review.id} className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-800">{review.patient.name}</p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star key={n} className={`h-3.5 w-3.5 ${n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                    {review.comment && <p className="mt-1 text-sm text-gray-600">{review.comment}</p>}
                    <p className="mt-1 text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {showChat && (
        <ChatPanel
          doctorUserId={doctor.user.id}
          doctorName={doctor.user.name}
          isOnline={doctor.isOnline}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  )
}
