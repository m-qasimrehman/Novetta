import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FileText, ChevronRight, Pill, ShoppingCart } from 'lucide-react'
import { Navbar } from '../../../components/layouts/Navbar'
import { Footer } from '../../../components/layouts/Footer'
import { prescriptionsApi, type Prescription } from '../../../lib/api'
import { ROUTES } from '../../../constants/routes'

export function PrescriptionsPage() {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: () => prescriptionsApi.list().then(r => r.data.data),
  })

  const prescriptions: Prescription[] = data ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Prescriptions</h1>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-200" />)}
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="py-20 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-400 font-medium">No prescriptions yet</p>
            <p className="text-gray-400 text-sm mt-1">Prescriptions from your consultations will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map(rx => (
              <div
                key={rx.id}
                onClick={() => navigate(ROUTES.prescriptionDetail(rx.id))}
                className="cursor-pointer rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md hover:border-brand-300 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100">
                      <FileText className="h-5 w-5 text-brand-500" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Prescription</p>
                      <p className="text-sm text-gray-500">{rx.doctor.user.name} · {rx.doctor.specialization}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(rx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 shrink-0 mt-1" />
                </div>

                {rx.items.length > 0 && (
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <div className="flex flex-wrap gap-1.5">
                      {rx.items.slice(0, 3).map(item => (
                        <span key={item.id} className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                          <Pill className="h-3 w-3" /> {item.medicineName}
                        </span>
                      ))}
                      {rx.items.length > 3 && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">+{rx.items.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-3 flex justify-end">
                  <button
                    onClick={e => { e.stopPropagation(); navigate(ROUTES.pharmacy + `?prescriptionId=${rx.id}`) }}
                    className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-100"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" /> Order Medicines
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
