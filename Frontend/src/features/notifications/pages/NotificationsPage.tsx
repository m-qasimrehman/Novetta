import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, Info, Calendar, FlaskConical, Pill, FileText } from 'lucide-react'
import { Navbar } from '../../../components/layouts/Navbar'
import { Footer } from '../../../components/layouts/Footer'
import { apiClient } from '../../../lib/axios'
import { useToast } from '../../../hooks/useToast'

interface Notification {
  id: string
  title: string
  body: string
  type: string
  isRead: boolean
  link: string | null
  createdAt: string
}

const TYPE_ICONS: Record<string, any> = {
  appointment: Calendar,
  lab: FlaskConical,
  pharmacy: Pill,
  prescription: FileText,
  info: Info,
}

export function NotificationsPage() {
  const toast = useToast()
  const qc = useQueryClient()

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => apiClient.get('/notifications').then(r => Array.isArray(r.data) ? r.data : r.data.data ?? []),
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/notifications/${id}/read`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => apiClient.patch('/notifications/read-all').then(r => r.data),
    onSuccess: () => {
      toast.pushToast({ title: 'All marked as read', variant: 'success' })
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const unread = notifications.filter(n => !n.isRead).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Bell className="h-6 w-6 text-brand-500" /> Notifications
            </h1>
            {unread > 0 && (
              <p className="text-sm text-gray-500 mt-0.5">{unread} unread</p>
            )}
          </div>
          {unread > 0 && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:underline disabled:opacity-60"
            >
              <CheckCheck className="h-4 w-4" /> Mark all read
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse h-20 rounded-xl bg-white border border-gray-200" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-gray-400 bg-white rounded-xl border border-gray-200">
            <Bell className="h-12 w-12 mb-3" />
            <p className="font-semibold text-gray-600">No notifications yet</p>
            <p className="text-sm mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => {
              const Icon = TYPE_ICONS[n.type] ?? Info
              return (
                <div
                  key={n.id}
                  onClick={() => { if (!n.isRead) markReadMutation.mutate(n.id) }}
                  className={`flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-colors ${
                    n.isRead ? 'bg-white border-gray-100' : 'bg-brand-50 border-brand-100'
                  }`}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${n.isRead ? 'bg-gray-100' : 'bg-brand-100'}`}>
                    <Icon className={`h-4 w-4 ${n.isRead ? 'text-gray-400' : 'text-brand-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</p>
                      {!n.isRead && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500 mt-1.5" />
                      )}
                    </div>
                    {n.body && <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>}
                    <p className="text-[11px] text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
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
