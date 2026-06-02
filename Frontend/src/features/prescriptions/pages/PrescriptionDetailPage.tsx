import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, FileText, Pill, ShoppingCart, Printer, User } from 'lucide-react'
import { Navbar } from '../../../components/layouts/Navbar'
import { Footer } from '../../../components/layouts/Footer'
import { prescriptionsApi } from '../../../lib/api'
import { ROUTES } from '../../../constants/routes'

export function PrescriptionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['prescription', id],
    queryFn: () => prescriptionsApi.getOne(id!).then(r => r.data.data),
    enabled: !!id,
  })

  const rx = data

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="h-96 animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    )
  }

  if (!rx) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-brand-500">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        {/* Prescription card */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="brand-gradient text-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-sm">Prescription</p>
                <p className="font-mono text-lg font-bold">RX-{rx.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <FileText className="h-8 w-8 text-white/60" />
            </div>
            <p className="mt-3 text-white/80 text-sm">{new Date(rx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          {/* Doctor & Patient */}
          <div className="grid grid-cols-2 gap-4 p-5 border-b border-gray-100">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><User className="h-3 w-3" /> Prescribed by</p>
              <p className="font-bold text-gray-900">{rx.doctor.user.name}</p>
              <p className="text-sm text-gray-500">{rx.doctor.specialization}</p>
              <p className="text-xs text-gray-400">{rx.doctor.qualification}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><User className="h-3 w-3" /> Patient</p>
              <p className="font-bold text-gray-900">{rx.patient?.name}</p>
              <p className="text-sm text-gray-500">{rx.patient?.email}</p>
              {rx.patient?.phone && <p className="text-xs text-gray-400">{rx.patient.phone}</p>}
            </div>
          </div>

          {/* Medicines */}
          <div className="p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Pill className="h-4 w-4 text-brand-500" /> Medicines
            </h2>

            {rx.items.length === 0 ? (
              <p className="text-gray-400 text-sm">No medicines listed.</p>
            ) : (
              <div className="space-y-3">
                {rx.items.map((item, i) => (
                  <div key={item.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white text-xs font-bold">{i + 1}</span>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{item.medicineName}</p>
                        <div className="mt-1.5 grid grid-cols-3 gap-2 text-xs">
                          {item.dosage && (
                            <div>
                              <p className="text-gray-400">Dosage</p>
                              <p className="font-medium text-gray-700">{item.dosage}</p>
                            </div>
                          )}
                          {item.frequency && (
                            <div>
                              <p className="text-gray-400">Frequency</p>
                              <p className="font-medium text-gray-700">{item.frequency}</p>
                            </div>
                          )}
                          {item.duration && (
                            <div>
                              <p className="text-gray-400">Duration</p>
                              <p className="font-medium text-gray-700">{item.duration}</p>
                            </div>
                          )}
                        </div>
                        {item.instructions && (
                          <p className="mt-1.5 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">{item.instructions}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {rx.notes && (
              <div className="mt-4 rounded-lg bg-blue-50 border border-blue-100 p-3">
                <p className="text-xs font-semibold text-blue-700 mb-1">Doctor's Notes</p>
                <p className="text-sm text-blue-800">{rx.notes}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-gray-100 p-5">
            <button
              onClick={() => window.print()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Printer className="h-4 w-4" /> Print
            </button>
            <button
              onClick={() => navigate(`${ROUTES.pharmacy}?prescriptionId=${rx.id}`)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600"
            >
              <ShoppingCart className="h-4 w-4" /> Order Medicines
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
