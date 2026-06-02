import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Heart, Users, Plus, Trash2, Edit2, Check, X, MapPin, Home, Star } from 'lucide-react'
import { Navbar } from '../../../components/layouts/Navbar'
import { Footer } from '../../../components/layouts/Footer'
import { profileApi, type MedicalHistory, type Dependent, type SavedAddress } from '../../../lib/api'
import { authStore } from '../../auth/store/authStore'

type Tab = 'profile' | 'history' | 'family' | 'addresses'

export function ProfilePage() {
  const queryClient = useQueryClient()
  const user = authStore((s: any) => s.user)
  const [tab, setTab] = useState<Tab>('profile')

  // Profile
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' })

  const updateProfileMutation = useMutation({
    mutationFn: () => profileApi.update({ name: profileForm.name || undefined, phone: profileForm.phone || undefined }),
    onSuccess: () => { setEditingProfile(false); queryClient.invalidateQueries({ queryKey: ['profile'] }) },
  })

  // Medical History
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['medical-history'],
    queryFn: () => profileApi.listHistory().then(r => r.data.data),
    enabled: tab === 'history',
  })
  const history: MedicalHistory[] = historyData ?? []

  const [showAddHistory, setShowAddHistory] = useState(false)
  const [historyForm, setHistoryForm] = useState({ condition: '', diagnosedAt: '', notes: '' })

  const addHistoryMutation = useMutation({
    mutationFn: () => profileApi.addHistory({ condition: historyForm.condition, diagnosedAt: historyForm.diagnosedAt || undefined, notes: historyForm.notes || undefined }),
    onSuccess: () => { setShowAddHistory(false); setHistoryForm({ condition: '', diagnosedAt: '', notes: '' }); queryClient.invalidateQueries({ queryKey: ['medical-history'] }) },
  })

  const deleteHistoryMutation = useMutation({
    mutationFn: (id: string) => profileApi.deleteHistory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medical-history'] }),
  })

  // Dependents
  const { data: dependentsData, isLoading: depLoading } = useQuery({
    queryKey: ['dependents'],
    queryFn: () => profileApi.listDependents().then(r => r.data.data),
    enabled: tab === 'family',
  })
  const dependents: Dependent[] = dependentsData ?? []

  const [showAddDep, setShowAddDep] = useState(false)
  const [depForm, setDepForm] = useState({ name: '', relationship: '', dateOfBirth: '', gender: '', bloodGroup: '' })

  const addDepMutation = useMutation({
    mutationFn: () => profileApi.addDependent({ name: depForm.name, relationship: depForm.relationship, dateOfBirth: depForm.dateOfBirth || undefined, gender: depForm.gender || undefined, bloodGroup: depForm.bloodGroup || undefined }),
    onSuccess: () => { setShowAddDep(false); setDepForm({ name: '', relationship: '', dateOfBirth: '', gender: '', bloodGroup: '' }); queryClient.invalidateQueries({ queryKey: ['dependents'] }) },
  })

  const deleteDepMutation = useMutation({
    mutationFn: (id: string) => profileApi.deleteDependent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dependents'] }),
  })

  // Addresses
  const { data: addressesData, isLoading: addrLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => profileApi.listAddresses().then(r => r.data.data),
    enabled: tab === 'addresses',
  })
  const addresses: SavedAddress[] = addressesData ?? []

  const [showAddAddr, setShowAddAddr] = useState(false)
  const [addrForm, setAddrForm] = useState({ label: '', address: '', city: '', isDefault: false })

  const addAddrMutation = useMutation({
    mutationFn: () => profileApi.addAddress({ label: addrForm.label, address: addrForm.address, city: addrForm.city || undefined, isDefault: addrForm.isDefault }),
    onSuccess: () => { setShowAddAddr(false); setAddrForm({ label: '', address: '', city: '', isDefault: false }); queryClient.invalidateQueries({ queryKey: ['addresses'] }) },
  })

  const setDefaultAddrMutation = useMutation({
    mutationFn: (id: string) => profileApi.setDefaultAddress(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  })

  const deleteAddrMutation = useMutation({
    mutationFn: (id: string) => profileApi.deleteAddress(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          {([['profile', User, 'Profile'], ['history', Heart, 'History'], ['family', Users, 'Family'], ['addresses', MapPin, 'Addresses']] as const).map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${tab === key ? 'bg-brand-500 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Personal Information</h2>
              {!editingProfile ? (
                <button
                  onClick={() => { setProfileForm({ name: user?.name ?? '', phone: user?.phone ?? '' }); setEditingProfile(true) }}
                  className="flex items-center gap-1.5 text-sm text-brand-500 hover:underline"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => updateProfileMutation.mutate()} disabled={updateProfileMutation.isPending} className="flex items-center gap-1 text-sm text-green-600 hover:underline disabled:opacity-40">
                    <Check className="h-3.5 w-3.5" /> Save
                  </button>
                  <button onClick={() => setEditingProfile(false)} className="flex items-center gap-1 text-sm text-gray-500 hover:underline">
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-2xl font-bold">
                {(user?.name as string)?.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase() ?? 'U'}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className="mt-1 inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600">Verified</span>
              </div>
            </div>

            <div className="space-y-4 border-t border-gray-100 pt-4">
              {editingProfile ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                    <input
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
                      value={profileForm.name}
                      onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Phone Number</label>
                    <input
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
                      value={profileForm.phone}
                      onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+92..."
                    />
                  </div>
                </>
              ) : (
                <>
                  <InfoRow label="Name" value={user?.name} />
                  <InfoRow label="Email" value={user?.email} />
                  <InfoRow label="Phone" value={(user as any)?.phone ?? 'Not set'} />
                  <InfoRow label="Role" value={user?.role} />
                </>
              )}
            </div>
          </div>
        )}

        {/* Medical History Tab */}
        {tab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{history.length} conditions recorded</p>
              <button
                onClick={() => setShowAddHistory(v => !v)}
                className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
              >
                <Plus className="h-4 w-4" /> Add Condition
              </button>
            </div>

            {showAddHistory && (
              <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 space-y-3">
                <h3 className="font-semibold text-gray-900">Add Medical Condition</h3>
                <input
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
                  placeholder="Condition name (e.g. Diabetes Type 2)"
                  value={historyForm.condition}
                  onChange={e => setHistoryForm(p => ({ ...p, condition: e.target.value }))}
                />
                <input
                  type="date"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
                  placeholder="Date diagnosed"
                  value={historyForm.diagnosedAt}
                  onChange={e => setHistoryForm(p => ({ ...p, diagnosedAt: e.target.value }))}
                />
                <textarea
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm resize-none focus:border-brand-400 focus:outline-none"
                  rows={2}
                  placeholder="Additional notes..."
                  value={historyForm.notes}
                  onChange={e => setHistoryForm(p => ({ ...p, notes: e.target.value }))}
                />
                <div className="flex gap-2">
                  <button onClick={() => setShowAddHistory(false)} className="flex-1 rounded-xl border border-gray-200 bg-white py-2 text-sm font-semibold text-gray-600">Cancel</button>
                  <button
                    onClick={() => addHistoryMutation.mutate()}
                    disabled={!historyForm.condition || addHistoryMutation.isPending}
                    className="flex-1 rounded-xl bg-brand-500 py-2 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    {addHistoryMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            )}

            {historyLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />)}</div>
            ) : history.length === 0 ? (
              <div className="py-12 text-center">
                <Heart className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                <p className="text-gray-400">No conditions recorded</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map(entry => (
                  <div key={entry.id} className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4">
                    <div>
                      <p className="font-semibold text-gray-900">{entry.condition}</p>
                      {entry.diagnosedAt && <p className="text-xs text-gray-500 mt-0.5">Diagnosed: {new Date(entry.diagnosedAt).toLocaleDateString()}</p>}
                      {entry.notes && <p className="text-sm text-gray-500 mt-1">{entry.notes}</p>}
                      <span className={`mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${entry.isCurrent ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                        {entry.isCurrent ? 'Current' : 'Past'}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteHistoryMutation.mutate(entry.id)}
                      className="ml-3 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Family Tab */}
        {tab === 'family' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{dependents.length} family members added</p>
              <button
                onClick={() => setShowAddDep(v => !v)}
                className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
              >
                <Plus className="h-4 w-4" /> Add Member
              </button>
            </div>

            {showAddDep && (
              <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 space-y-3">
                <h3 className="font-semibold text-gray-900">Add Family Member</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input className="col-span-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none" placeholder="Full name" value={depForm.name} onChange={e => setDepForm(p => ({ ...p, name: e.target.value }))} />
                  <select className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none" value={depForm.relationship} onChange={e => setDepForm(p => ({ ...p, relationship: e.target.value }))}>
                    <option value="">Relationship</option>
                    {['Spouse', 'Child', 'Parent', 'Sibling', 'Other'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <select className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none" value={depForm.gender} onChange={e => setDepForm(p => ({ ...p, gender: e.target.value }))}>
                    <option value="">Gender</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                  <input type="date" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none" value={depForm.dateOfBirth} onChange={e => setDepForm(p => ({ ...p, dateOfBirth: e.target.value }))} />
                  <select className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none" value={depForm.bloodGroup} onChange={e => setDepForm(p => ({ ...p, bloodGroup: e.target.value }))}>
                    <option value="">Blood Group</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddDep(false)} className="flex-1 rounded-xl border border-gray-200 bg-white py-2 text-sm font-semibold text-gray-600">Cancel</button>
                  <button
                    onClick={() => addDepMutation.mutate()}
                    disabled={!depForm.name || !depForm.relationship || addDepMutation.isPending}
                    className="flex-1 rounded-xl bg-brand-500 py-2 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    {addDepMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            )}

            {depLoading ? (
              <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />)}</div>
            ) : dependents.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                <p className="text-gray-400">No family members added</p>
                <p className="text-xs text-gray-400 mt-1">Book appointments for family members</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dependents.map(dep => (
                  <div key={dep.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600 font-bold text-sm">
                        {dep.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{dep.name}</p>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-brand-600 font-medium">{dep.relationship}</span>
                          {dep.gender && <span>{dep.gender}</span>}
                          {dep.bloodGroup && <span className="rounded-full bg-red-50 px-2 py-0.5 text-red-600 font-medium">{dep.bloodGroup}</span>}
                          {dep.dateOfBirth && <span>DOB: {new Date(dep.dateOfBirth).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteDepMutation.mutate(dep.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Addresses Tab */}
        {tab === 'addresses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{addresses.length} saved addresses</p>
              <button onClick={() => setShowAddAddr(v => !v)} className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
                <Plus className="h-4 w-4" /> Add Address
              </button>
            </div>

            {showAddAddr && (
              <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 space-y-3">
                <h3 className="font-semibold text-gray-900">Add New Address</h3>
                <div className="grid grid-cols-2 gap-3">
                  <select className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none" value={addrForm.label} onChange={e => setAddrForm(p => ({ ...p, label: e.target.value }))}>
                    <option value="">Label</option>
                    {['Home', 'Work', 'Other'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <input className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none" placeholder="City" value={addrForm.city} onChange={e => setAddrForm(p => ({ ...p, city: e.target.value }))} />
                  <textarea className="col-span-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm resize-none focus:border-brand-400 focus:outline-none" rows={2} placeholder="Full address..." value={addrForm.address} onChange={e => setAddrForm(p => ({ ...p, address: e.target.value }))} />
                  <label className="col-span-2 flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" checked={addrForm.isDefault} onChange={e => setAddrForm(p => ({ ...p, isDefault: e.target.checked })) } className="rounded" />
                    Set as default address
                  </label>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddAddr(false)} className="flex-1 rounded-xl border border-gray-200 bg-white py-2 text-sm font-semibold text-gray-600">Cancel</button>
                  <button onClick={() => addAddrMutation.mutate()} disabled={!addrForm.label || !addrForm.address || addAddrMutation.isPending} className="flex-1 rounded-xl bg-brand-500 py-2 text-sm font-semibold text-white disabled:opacity-40">
                    {addAddrMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            )}

            {addrLoading ? (
              <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />)}</div>
            ) : addresses.length === 0 ? (
              <div className="py-12 text-center">
                <MapPin className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                <p className="text-gray-400">No saved addresses</p>
                <p className="text-xs text-gray-400 mt-1">Add addresses for quick checkout</p>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map(addr => (
                  <div key={addr.id} className={`rounded-xl border p-4 ${addr.isDefault ? 'border-brand-300 bg-brand-50' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${addr.isDefault ? 'bg-brand-100' : 'bg-gray-100'}`}>
                          {addr.label === 'Home' ? <Home className="h-4 w-4 text-brand-500" /> : <MapPin className="h-4 w-4 text-gray-500" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 text-sm">{addr.label}</p>
                            {addr.isDefault && <span className="flex items-center gap-0.5 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white"><Star className="h-2.5 w-2.5" /> Default</span>}
                          </div>
                          <p className="text-sm text-gray-600 mt-0.5">{addr.address}</p>
                          {addr.city && <p className="text-xs text-gray-400">{addr.city}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!addr.isDefault && (
                          <button onClick={() => setDefaultAddrMutation.mutate(addr.id)} className="text-xs text-brand-500 hover:underline">Set default</button>
                        )}
                        <button onClick={() => deleteAddrMutation.mutate(addr.id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-800 capitalize">{value ?? '—'}</span>
    </div>
  )
}
