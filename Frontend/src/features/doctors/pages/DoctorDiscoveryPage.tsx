import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, Star, MapPin, Video, Building2, Home, SlidersHorizontal, X } from 'lucide-react'
import { Navbar } from '../../../components/layouts/Navbar'
import { Footer } from '../../../components/layouts/Footer'
import { doctorsApi, type Doctor } from '../../../lib/api'
import { ROUTES } from '../../../constants/routes'

const SPECIALIZATIONS = [
  'General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician',
  'Orthopedic Surgeon', 'Gynecologist', 'Neurologist', 'Psychiatrist',
  'ENT Specialist', 'Ophthalmologist', 'Urologist', 'Gastroenterologist',
]

const SYMPTOM_MAP: { symptom: string; emoji: string; specialization: string }[] = [
  { symptom: 'Fever / Cold',       emoji: '🤒', specialization: 'General Physician' },
  { symptom: 'Chest Pain',         emoji: '❤️', specialization: 'Cardiologist' },
  { symptom: 'Skin Problems',      emoji: '🧴', specialization: 'Dermatologist' },
  { symptom: 'Child Health',       emoji: '👶', specialization: 'Pediatrician' },
  { symptom: 'Joint / Bone Pain',  emoji: '🦴', specialization: 'Orthopedic Surgeon' },
  { symptom: "Women's Health",     emoji: '👩', specialization: 'Gynecologist' },
  { symptom: 'Headache / Nervous', emoji: '🧠', specialization: 'Neurologist' },
  { symptom: 'Mental Health',      emoji: '💚', specialization: 'Psychiatrist' },
  { symptom: 'Ear / Nose / Throat',emoji: '👂', specialization: 'ENT Specialist' },
  { symptom: 'Eye Problems',       emoji: '👁️', specialization: 'Ophthalmologist' },
  { symptom: 'Stomach / Digestion',emoji: '🫃', specialization: 'Gastroenterologist' },
]

const CONSULTATION_TYPES = [
  { value: 'telehealth', label: 'Telehealth', icon: Video },
  { value: 'in-clinic', label: 'In Clinic', icon: Building2 },
  { value: 'home-visit', label: 'Home Visit', icon: Home },
]

function DoctorCard({ doctor }: { doctor: Doctor }) {
  const navigate = useNavigate()
  const fee = doctor.consultationFee ? `PKR ${Number(doctor.consultationFee).toLocaleString()}` : 'Fee not listed'

  return (
    <div
      onClick={() => navigate(ROUTES.doctorProfile(doctor.id))}
      className="cursor-pointer rounded-xl border border-gray-200 bg-white p-5 hover:shadow-lg hover:border-brand-300 transition-all"
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-xl font-bold">
          {doctor.user.name.split(' ').filter((_, i) => i > 0).map(p => p[0]).join('').slice(0, 2)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-gray-900 truncate">{doctor.user.name}</h3>
              <p className="text-sm text-brand-600 font-medium">{doctor.specialization}</p>
              <p className="text-xs text-gray-500">{doctor.qualification}</p>
            </div>
            {doctor.isOnline && (
              <span className="shrink-0 flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Online
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span className="font-semibold text-gray-700">{Number(doctor.rating).toFixed(1)}</span>
              <span>({doctor.totalReviews})</span>
            </span>
            <span>{doctor.experience} yrs exp.</span>
            {doctor.city && (
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" /> {doctor.city}
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {doctor.consultationTypes.map(type => {
              const ct = CONSULTATION_TYPES.find(c => c.value === type)
              if (!ct) return null
              const Icon = ct.icon
              return (
                <span key={type} className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  <Icon className="h-3 w-3" /> {ct.label}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <div>
          <p className="text-xs text-gray-500">Consultation fee</p>
          <p className="font-bold text-brand-600">{fee}</p>
        </div>
        <button
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          onClick={e => { e.stopPropagation(); navigate(ROUTES.bookAppointment(doctor.id)) }}
        >
          Book Now
        </button>
      </div>
    </div>
  )
}

export function DoctorDiscoveryPage() {
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [consultationType, setConsultationType] = useState('')
  const [city, setCity] = useState('')
  const [minRating, setMinRating] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['doctors', search, specialization, consultationType, city, minRating, page],
    queryFn: () => doctorsApi.search({ q: search || undefined, specialization: specialization || undefined, consultationType: consultationType || undefined, city: city || undefined, minRating: minRating ? Number(minRating) : undefined, page }).then(r => r.data),
  })

  const doctors: Doctor[] = (data as any)?.doctors ?? []
  const pagination = (data as any)?.pagination

  const clearFilters = () => {
    setSpecialization('')
    setConsultationType('')
    setCity('')
    setMinRating('')
    setSearch('')
    setQ('')
    setPage(1)
  }

  const hasFilters = search || specialization || consultationType || city || minRating

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Find a Doctor</h1>
          <p className="text-gray-500 text-sm mt-1">Browse {pagination?.total ?? '...'} verified doctors</p>
        </div>

        {/* Search bar */}
        <form
          className="mb-4 flex gap-2"
          onSubmit={e => { e.preventDefault(); setSearch(q); setPage(1) }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200"
              placeholder="Search by name, specialization, or city..."
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
          <button type="submit" className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(v => !v)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        </form>

        {/* Symptom quick-select */}
        {!search && !specialization && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Search by symptom</p>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_MAP.map(s => (
                <button
                  key={s.symptom}
                  onClick={() => { setSpecialization(s.specialization); setPage(1) }}
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                >
                  <span>{s.emoji}</span> {s.symptom}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters panel */}
        {showFilters && (
          <div className="mb-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Specialization</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                  value={specialization}
                  onChange={e => { setSpecialization(e.target.value); setPage(1) }}
                >
                  <option value="">All specializations</option>
                  {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Consultation Type</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                  value={consultationType}
                  onChange={e => { setConsultationType(e.target.value); setPage(1) }}
                >
                  <option value="">All types</option>
                  {CONSULTATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">City</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                  value={city}
                  onChange={e => { setCity(e.target.value); setPage(1) }}
                >
                  <option value="">All cities</option>
                  {['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Peshawar'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Min. Rating</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                  value={minRating}
                  onChange={e => { setMinRating(e.target.value); setPage(1) }}
                >
                  <option value="">Any rating</option>
                  {[4, 3, 2].map(r => (
                    <option key={r} value={r}>{r}+ Stars</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active filters */}
        {hasFilters && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">Active filters:</span>
            {search && <span className="flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700">"{search}" <X className="h-3 w-3 cursor-pointer" onClick={() => { setSearch(''); setQ('') }} /></span>}
            {specialization && <span className="flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700">{specialization} <X className="h-3 w-3 cursor-pointer" onClick={() => setSpecialization('')} /></span>}
            {consultationType && <span className="flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700">{consultationType} <X className="h-3 w-3 cursor-pointer" onClick={() => setConsultationType('')} /></span>}
            {city && <span className="flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700">{city} <X className="h-3 w-3 cursor-pointer" onClick={() => setCity('')} /></span>}
            {minRating && <span className="flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700">{minRating}+ Stars <X className="h-3 w-3 cursor-pointer" onClick={() => setMinRating('')} /></span>}
            <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">Clear all</button>
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-lg">No doctors found</p>
            <p className="text-gray-400 text-sm mt-1">Try different search terms or filters</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map(doc => <DoctorCard key={doc.id} doctor={doc} />)}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">Page {page} of {pagination.pages}</span>
            <button
              disabled={page === pagination.pages}
              onClick={() => setPage(p => p + 1)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
