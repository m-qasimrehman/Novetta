import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Package, MapPin, Clock, ChevronRight, ShoppingBag, ScanLine } from 'lucide-react'
import { Navbar } from '../../../components/layouts/Navbar'
import { Footer } from '../../../components/layouts/Footer'
import { pharmacyApi, type PharmacyOrder } from '../../../lib/api'
import { ROUTES } from '../../../constants/routes'

const STATUS_STYLES: Record<string, { color: string; label: string }> = {
  pending:    { color: 'bg-amber-50 text-amber-700 border-amber-200',   label: 'Pending' },
  confirmed:  { color: 'bg-blue-50 text-blue-700 border-blue-200',      label: 'Confirmed' },
  preparing:  { color: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Preparing' },
  on_the_way: { color: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'On the Way' },
  delivered:  { color: 'bg-green-50 text-green-700 border-green-200',   label: 'Delivered' },
  cancelled:  { color: 'bg-red-50 text-red-700 border-red-200',         label: 'Cancelled' },
}

export function MyOrdersPage() {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['pharmacy-orders'],
    queryFn: () => pharmacyApi.listOrders().then(r => r.data),
  })
  const orders: PharmacyOrder[] = (data as any)?.data ?? []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <button
            onClick={() => navigate(ROUTES.pharmacy)}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            <ShoppingBag className="h-4 w-4" /> Shop More
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="py-20 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h2 className="text-lg font-bold text-gray-700">No orders yet</h2>
            <p className="text-gray-400 text-sm mt-1">Your medicine orders will appear here</p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => navigate(ROUTES.pharmacy)}
                className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Browse Medicines
              </button>
              <button
                onClick={() => navigate(ROUTES.pharmacyScan)}
                className="flex items-center gap-2 rounded-xl border border-brand-300 px-5 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50"
              >
                <ScanLine className="h-4 w-4" /> Scan Prescription
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const status = STATUS_STYLES[order.status] ?? STATUS_STYLES['pending']
              return (
                <div
                  key={order.id}
                  onClick={() => navigate(ROUTES.pharmacyOrderTracking(order.id))}
                  className="cursor-pointer rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${status.color}`}>
                          {status.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      <div className="flex -space-x-1 mb-2">
                        {order.items.slice(0, 4).map(item => (
                          <div key={item.id} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-100 text-xs font-bold text-brand-600">
                            {item.medicine.name.slice(0, 1)}
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-bold text-gray-500">
                            +{order.items.length - 4}
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 truncate">
                        {order.items.map(i => i.medicine.name).join(', ')}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Package className="h-3.5 w-3.5" /> {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {order.deliveryType === 'delivery' ? 'Home Delivery' : 'Pickup'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> ~45 min
                        </span>
                        <span className="font-bold text-brand-600">PKR {Number(order.totalAmount).toLocaleString()}</span>
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-400 shrink-0 mt-1" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
