import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PhoneOff, FileText, Clock, ExternalLink, Pill, Plus, Trash2, Send, MessageSquare } from 'lucide-react'
import { telehealthApi, doctorPanelApi, chatApi } from '../../../lib/api'
import { authStore } from '../../auth/store/authStore'
import { ROUTES } from '../../../constants/routes'

export function TelehealthPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const user = authStore(s => (s as any).user)
  const isDoctor = user?.role === 'doctor'

  const [rxItems, setRxItems] = useState([{ medicineName: '', dosage: '', frequency: '', duration: '' }])
  const [rxNotes, setRxNotes] = useState('')
  const [rxSent, setRxSent] = useState(false)
  const [chatMsg, setChatMsg] = useState('')
  const [sidePanel, setSidePanel] = useState<'info' | 'chat'>('info')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['telehealth', id],
    queryFn: () => telehealthApi.getOne(id!).then(r => r.data.data),
    enabled: !!id,
    refetchInterval: 15000,
  })

  const endMut = useMutation({
    mutationFn: () => telehealthApi.end(id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['telehealth', id] }); navigate(ROUTES.appointments) },
  })

  const rxMut = useMutation({
    mutationFn: () => doctorPanelApi.issuePrescription({
      patientId: session!.patient?.id ?? session!.patientId,
      appointmentId: session!.appointmentId ?? undefined,
      notes: rxNotes || undefined,
      items: rxItems.filter(i => i.medicineName.trim()),
    }),
    onSuccess: () => { setRxSent(true); setRxItems([{ medicineName: '', dosage: '', frequency: '', duration: '' }]); setRxNotes('') },
  })

  const session = data
  const chatPartnerId = isDoctor ? session?.patientId : (session?.doctorId ?? session?.doctor?.userId)

  const { data: chatData } = useQuery({
    queryKey: ['telehealth-chat', id, chatPartnerId],
    queryFn: () => chatApi.getConversation(chatPartnerId!).then(r => r.data.data),
    enabled: !!chatPartnerId && sidePanel === 'chat',
    refetchInterval: 8000,
  })

  const sendChatMut = useMutation({
    mutationFn: () => chatApi.send(chatPartnerId!, chatMsg.trim()),
    onSuccess: () => { setChatMsg(''); qc.invalidateQueries({ queryKey: ['telehealth-chat', id] }) },
  })

  const chatMessages: any[] = chatData ?? []
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages.length])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-brand-400 border-t-transparent mx-auto mb-4" />
          <p>Loading session...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Session not found or you don't have access.</p>
          <button onClick={() => navigate(ROUTES.appointments)} className="rounded-lg bg-brand-500 px-4 py-2 text-white font-semibold">
            Back to Appointments
          </button>
        </div>
      </div>
    )
  }

  const jitsiRoom = session.meetingUrl?.includes('jit.si')
    ? session.meetingUrl
    : `https://meet.jit.si/novetta-${session.roomCode}`

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-800 border-b border-gray-700 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white text-sm font-bold">
            {session.doctor?.user?.name?.split(' ').filter((_: any, i: number) => i > 0).map((p: string) => p[0]).join('').slice(0, 2) ?? 'DR'}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{session.doctor?.user?.name}</p>
            <p className="text-gray-400 text-xs">{session.doctor?.specialization}</p>
          </div>
          <span className={`ml-4 flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold ${
            session.status === 'active' ? 'bg-green-500 text-white' :
            session.status === 'completed' ? 'bg-gray-600 text-gray-200' :
            'bg-amber-500 text-white'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full bg-white ${session.status === 'active' ? 'animate-pulse' : ''}`} />
            {session.status === 'active' ? 'In Progress' : session.status === 'completed' ? 'Ended' : 'Scheduled'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-mono font-bold text-brand-400">{session.roomCode}</span>
          </div>
          <a href={jitsiRoom} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-gray-600 px-3 py-1.5 text-xs text-gray-300 hover:border-brand-400 hover:text-brand-400">
            <ExternalLink className="h-3.5 w-3.5" /> Open in New Tab
          </a>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Jitsi iframe */}
        <div className="flex-1 relative bg-black">
          {session.status === 'completed' ? (
            <div className="flex h-full items-center justify-center text-center text-white">
              <div>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-700">
                  <PhoneOff className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-xl font-bold">Call Ended</p>
                <p className="mt-1 text-gray-400 text-sm">This telehealth session has concluded.</p>
                <button onClick={() => navigate(ROUTES.appointments)}
                  className="mt-6 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
                  Back to Appointments
                </button>
              </div>
            </div>
          ) : (
            <iframe
              src={jitsiRoom}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="h-full w-full border-0"
              title="Telehealth Video Call"
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="w-72 shrink-0 flex flex-col bg-gray-800 border-l border-gray-700">
          {/* Sidebar tab toggle */}
          <div className="flex shrink-0 border-b border-gray-700">
            {(['info', 'chat'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSidePanel(tab)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold capitalize transition-colors ${sidePanel === tab ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'}`}
              >
                {tab === 'chat' ? <MessageSquare className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                {tab === 'info' ? 'Session' : 'Chat'}
              </button>
            ))}
          </div>

          {sidePanel === 'chat' ? (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-2 p-3">
                {chatMessages.length === 0 ? (
                  <p className="py-8 text-center text-xs text-gray-500">No messages yet. Start the conversation.</p>
                ) : chatMessages.map((m: any) => (
                  <div key={m.id} className={`flex ${m.isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${m.isMine ? 'bg-brand-500 text-white' : 'bg-gray-700 text-gray-100'}`}>
                      {m.message}
                      <p className={`mt-0.5 text-right text-[10px] ${m.isMine ? 'text-brand-200' : 'text-gray-500'}`}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="shrink-0 border-t border-gray-700 p-3">
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-xl bg-gray-700 px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-400"
                    placeholder="Type a message…"
                    value={chatMsg}
                    onChange={e => setChatMsg(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && chatMsg.trim()) { sendChatMut.mutate(); e.preventDefault() } }}
                  />
                  <button
                    disabled={!chatMsg.trim() || sendChatMut.isPending}
                    onClick={() => sendChatMut.mutate()}
                    className="rounded-xl bg-brand-500 p-2 text-white hover:bg-brand-600 disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
          <div className="flex flex-col gap-3 overflow-y-auto p-4">
          {/* Session info */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-4 space-y-2.5 text-xs">
            <p className="font-semibold text-white text-sm">Session Info</p>
            <div className="flex justify-between">
              <span className="text-gray-400">Patient</span>
              <span className="text-white">{session.patient?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Doctor</span>
              <span className="text-white">{session.doctor?.user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Date</span>
              <span className="text-white">{new Date(session.createdAt).toLocaleDateString()}</span>
            </div>
            {session.startedAt && (
              <div className="flex justify-between">
                <span className="text-gray-400">Started</span>
                <span className="text-white">{new Date(session.startedAt).toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="rounded-xl border border-blue-800 bg-blue-950 p-4 text-xs text-blue-200">
            <p className="font-semibold mb-1">How to join</p>
            <ol className="list-decimal ml-4 space-y-1 text-blue-300">
              <li>Allow camera &amp; microphone access when prompted</li>
              <li>Enter your name and click "Join Meeting"</li>
              <li>Share the room code <span className="font-mono font-bold text-blue-100">{session.roomCode}</span> if the other party hasn't joined</li>
            </ol>
          </div>

          {/* Prescriptions */}
          {(session.prescriptions?.length ?? 0) > 0 && (
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
              <p className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand-400" /> Prescriptions
              </p>
              {session.prescriptions?.map((p: any) => (
                <div key={p.id} className="rounded-lg bg-gray-700 p-2.5 mb-2">
                  <div className="space-y-1">
                    {p.items?.map((item: any) => (
                      <p key={item.id} className="text-xs text-gray-300 flex items-start gap-1.5">
                        <Pill className="h-3 w-3 shrink-0 mt-0.5 text-brand-400" />
                        {item.medicineName} {item.dosage && `· ${item.dosage}`} {item.frequency && `· ${item.frequency}`}
                      </p>
                    ))}
                  </div>
                  <button onClick={() => navigate(ROUTES.prescriptionDetail(p.id))}
                    className="mt-2 text-xs text-brand-400 hover:underline">
                    View full →
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Issue Prescription (doctor only) */}
          {isDoctor && session.status !== 'completed' && (
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
              <p className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-400" /> Issue Prescription
              </p>
              {rxSent ? (
                <div className="rounded-lg bg-green-900 border border-green-700 p-3 text-xs text-green-300 text-center">
                  Prescription sent to patient!
                  <button className="mt-1 block w-full text-green-400 hover:underline" onClick={() => setRxSent(false)}>Issue another</button>
                </div>
              ) : (
                <>
                  {rxItems.map((item, idx) => (
                    <div key={idx} className="mb-2 rounded-lg bg-gray-800 p-2.5 space-y-1.5">
                      <div className="flex items-center gap-1">
                        <input
                          className="flex-1 rounded bg-gray-700 px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-400"
                          placeholder="Medicine name *"
                          value={item.medicineName}
                          onChange={e => setRxItems(prev => prev.map((r, i) => i === idx ? { ...r, medicineName: e.target.value } : r))}
                        />
                        {rxItems.length > 1 && (
                          <button onClick={() => setRxItems(prev => prev.filter((_, i) => i !== idx))}>
                            <Trash2 className="h-3.5 w-3.5 text-red-400 hover:text-red-300" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {(['dosage', 'frequency', 'duration'] as const).map(f => (
                          <input
                            key={f}
                            className="rounded bg-gray-700 px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-400"
                            placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                            value={item[f]}
                            onChange={e => setRxItems(prev => prev.map((r, i) => i === idx ? { ...r, [f]: e.target.value } : r))}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setRxItems(prev => [...prev, { medicineName: '', dosage: '', frequency: '', duration: '' }])}
                    className="mb-2 flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300"
                  >
                    <Plus className="h-3 w-3" /> Add medicine
                  </button>
                  <textarea
                    className="w-full rounded bg-gray-700 px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-400 resize-none"
                    rows={2}
                    placeholder="Notes (optional)"
                    value={rxNotes}
                    onChange={e => setRxNotes(e.target.value)}
                  />
                  <button
                    disabled={rxMut.isPending || rxItems.every(i => !i.medicineName.trim())}
                    onClick={() => rxMut.mutate()}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-600 py-2 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {rxMut.isPending ? 'Sending…' : 'Send Prescription'}
                  </button>
                  {rxMut.isError && (
                    <p className="mt-1 text-xs text-red-400">{(rxMut.error as any)?.response?.data?.message ?? 'Failed to send'}</p>
                  )}
                </>
              )}
            </div>
          )}

          {/* End call */}
          {session.status !== 'completed' && (
            <button
              onClick={() => endMut.mutate()}
              disabled={endMut.isPending}
              className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50"
            >
              <PhoneOff className="h-4 w-4" />
              {endMut.isPending ? 'Ending...' : 'End Call'}
            </button>
          )}
          </div>
          )}
        </div>
      </div>
    </div>
  )
}
