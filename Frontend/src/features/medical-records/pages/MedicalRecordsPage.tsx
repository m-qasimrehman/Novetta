import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Plus, X, Upload, Stethoscope, Activity, FileCheck, Pill } from 'lucide-react'
import { Navbar } from '../../../components/layouts/Navbar'
import { Footer } from '../../../components/layouts/Footer'
import { apiClient } from '../../../lib/axios'
import { useToast } from '../../../hooks/useToast'

interface MedicalRecord {
  id: string
  title: string
  description: string
  recordType: string
  fileUrl: string
  createdAt: string
}

const RECORD_TYPES = ['Lab Report', 'Prescription', 'Scan/X-Ray', 'Discharge Summary', 'Vaccination', 'Other']
const TYPE_ICONS: Record<string, any> = {
  'Lab Report': FileCheck,
  'Prescription': Pill,
  'Scan/X-Ray': Activity,
  'Discharge Summary': FileText,
  'Vaccination': Stethoscope,
  'Other': FileText,
}

export function MedicalRecordsPage() {
  const toast = useToast()
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', recordType: 'Lab Report', fileUrl: '' })

  const { data: records = [], isLoading } = useQuery<MedicalRecord[]>({
    queryKey: ['medical-records'],
    queryFn: () => apiClient.get('/medical-records').then(r => Array.isArray(r.data) ? r.data : r.data.data ?? []),
  })

  const createMutation = useMutation({
    mutationFn: (dto: typeof form) => apiClient.post('/medical-records', dto).then(r => r.data),
    onSuccess: () => {
      toast.pushToast({ title: 'Record added', variant: 'success' })
      qc.invalidateQueries({ queryKey: ['medical-records'] })
      setShowForm(false)
      setForm({ title: '', description: '', recordType: 'Lab Report', fileUrl: '' })
    },
    onError: () => toast.pushToast({ title: 'Failed to add record', variant: 'error' }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/medical-records/${id}`).then(r => r.data),
    onSuccess: () => {
      toast.pushToast({ title: 'Record deleted', variant: 'success' })
      qc.invalidateQueries({ queryKey: ['medical-records'] })
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Medical Records</h1>
            <p className="text-sm text-gray-500 mt-1">Your complete health history in one place</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" /> Add Record
          </button>
        </div>

        {/* Records */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="animate-pulse h-24 rounded-xl bg-white border border-gray-200" />)}
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-gray-400 bg-white rounded-xl border border-gray-200">
            <FileText className="h-12 w-12 mb-3" />
            <p className="font-semibold text-gray-600">No medical records yet</p>
            <p className="text-sm mt-1">Upload your first health document</p>
            <button onClick={() => setShowForm(true)} className="mt-4 rounded-lg bg-brand-500 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-600">
              Add Record
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map(r => {
              const Icon = TYPE_ICONS[r.recordType] ?? FileText
              return (
                <div key={r.id} className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-card">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50">
                    <Icon className="h-5 w-5 text-brand-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">{r.title}</h3>
                        <span className="inline-block mt-0.5 rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">{r.recordType}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {r.fileUrl && (
                          <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-500 hover:underline">View</a>
                        )}
                        <button onClick={() => deleteMutation.mutate(r.id)} className="text-gray-400 hover:text-red-500">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {r.description && <p className="mt-1 text-sm text-gray-500">{r.description}</p>}
                    <p className="mt-1 text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Footer />

      {/* Add Record Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Add Medical Record</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Record Type</label>
                <select value={form.recordType} onChange={e => setForm(f => ({ ...f, recordType: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400">
                  {RECORD_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., Blood Test Report - Jan 2025" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Brief notes about this record..." className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">File URL (optional)</label>
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-gray-400 shrink-0" />
                  <input value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} placeholder="https://..." className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400" />
                </div>
              </div>
            </div>
            <button
              onClick={() => { if (!form.title) { toast.pushToast({ title: 'Enter a title', variant: 'error' }); return } createMutation.mutate(form) }}
              disabled={createMutation.isPending}
              className="mt-5 w-full rounded-lg bg-brand-500 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {createMutation.isPending ? 'Saving…' : 'Save Record'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
