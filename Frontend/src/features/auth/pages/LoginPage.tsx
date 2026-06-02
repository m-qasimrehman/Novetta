import { useState, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import type { LoginRequest } from '../types/auth'
import { useNavigate } from 'react-router-dom'
import { Mail, User, Stethoscope, ShieldCheck, FlaskConical, Pill } from 'lucide-react'
import { authService } from '../services/authService'
import { authStore } from '../store/authStore'
import { Input } from '../../../components/ui/Input'
import { PasswordInput } from '../../../components/ui/PasswordInput'
import { AuthLayout } from '../components/AuthLayout'
import { useToast } from '../../../hooks/useToast'
import { loginSchema, type LoginFormValues } from '../schemas/authSchemas'
import { ROUTES } from '../../../constants/routes'
import { apiClient } from '../../../lib/axios'

// ── Role definitions ──────────────────────────────────────────────────────────
const PATIENT_ROLES = [
  {
    id: 'patient',
    label: 'Patient',
    icon: User,
    description: 'Book appointments & manage health',
    color: 'brand',
    email: '',
    password: '',
    redirect: ROUTES.welcome,
  },
  {
    id: 'doctor',
    label: 'Doctor',
    icon: Stethoscope,
    description: 'Manage your panel & schedule',
    color: 'indigo',
    email: 'doctor@novetta.health',
    password: 'Doctor123!',
    redirect: ROUTES.doctorPanel,
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: ShieldCheck,
    description: 'Platform management & analytics',
    color: 'rose',
    email: 'admin@novetta.health',
    password: 'Admin123!',
    redirect: ROUTES.admin,
  },
] as const

const STAFF_ROLES = [
  {
    id: 'pharmacist',
    label: 'Pharmacist',
    icon: Pill,
    description: 'Manage dispensing & consultations',
    color: 'purple',
    email: 'pharmacist@novetta.health',
    password: 'Pharmacist123!',
    redirect: ROUTES.pharmacistConsole,
  },
  {
    id: 'lab_coordinator',
    label: 'Lab Coordinator',
    icon: FlaskConical,
    description: 'Manage tests, bookings & reports',
    color: 'teal',
    email: 'labcoord@novetta.health',
    password: 'LabCoord123!',
    redirect: ROUTES.labCoordinator,
  },
] as const

const ALL_ROLES = [...PATIENT_ROLES, ...STAFF_ROLES]
type RoleId = typeof ALL_ROLES[number]['id']

const colorMap: Record<string, { card: string; active: string; badge: string; btn: string }> = {
  brand:  { card: 'border-brand-200 bg-brand-50',    active: 'ring-2 ring-brand-400',   badge: 'bg-brand-500 text-white',   btn: 'bg-brand-500 hover:bg-brand-600' },
  indigo: { card: 'border-indigo-200 bg-indigo-50',  active: 'ring-2 ring-indigo-400',  badge: 'bg-indigo-600 text-white',  btn: 'bg-indigo-600 hover:bg-indigo-700' },
  rose:   { card: 'border-rose-200 bg-rose-50',      active: 'ring-2 ring-rose-400',    badge: 'bg-rose-600 text-white',    btn: 'bg-rose-600 hover:bg-rose-700' },
  purple: { card: 'border-purple-200 bg-purple-50',  active: 'ring-2 ring-purple-400',  badge: 'bg-purple-600 text-white',  btn: 'bg-purple-600 hover:bg-purple-700' },
  teal:   { card: 'border-teal-200 bg-teal-50',      active: 'ring-2 ring-teal-400',    badge: 'bg-teal-600 text-white',    btn: 'bg-teal-600 hover:bg-teal-700' },
}

function redirectForRole(role: string): string {
  switch (role) {
    case 'doctor':          return ROUTES.doctorPanel
    case 'admin':           return ROUTES.admin
    case 'pharmacist':      return ROUTES.pharmacistConsole
    case 'lab_coordinator': return ROUTES.labCoordinator
    default:                return ROUTES.welcome
  }
}

export function LoginPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [selectedRole, setSelectedRole] = useState<RoleId>('patient')
  const [seedDone, setSeedDone] = useState(false)

  // Auto-seed demo staff users on mount (idempotent)
  useEffect(() => {
    apiClient.post('/auth/seed-demo').catch(() => {/* silent — best effort */}).finally(() => setSeedDone(true))
  }, [])

  type LoginResult = Awaited<ReturnType<typeof authService.login>>

  const loginMutation = useMutation<LoginResult, any, LoginRequest>({
    mutationFn: authService.login,
    onSuccess(data) {
      authStore.getState().setAuth({
        user: data.user ? { ...data.user, role: data.user.role as any } : null,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
      })
      toast.pushToast({ title: 'Welcome back!', description: 'Signed in successfully.', variant: 'success' })
      navigate(redirectForRole(data.user?.role ?? ''))
    },
    onError(error: any) {
      toast.pushToast({
        title: 'Login failed',
        description: error?.response?.data?.message ?? 'Please check your credentials.',
        variant: 'error',
      })
    },
  })

  const { control, register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { emailOrPhone: '', password: '', remember: false },
  })

  const handleRoleSelect = (role: typeof ALL_ROLES[number]) => {
    setSelectedRole(role.id as RoleId)
    if (role.email) setValue('emailOrPhone', role.email)
    if (role.password) setValue('password', role.password)
  }

  const activeRole = ALL_ROLES.find(r => r.id === selectedRole)!
  const c = colorMap[activeRole.color]
  const isStaffRole = selectedRole !== 'patient'

  return (
    <AuthLayout>
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-card">
        {/* Logo */}
        <div className="mb-5 text-center">
          <div className="flex justify-center mb-1">
            <span className="text-2xl font-black text-brand-500">Novetta</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Sign in to your account</h1>
          <p className="mt-1 text-sm text-gray-500">Choose your role to get started</p>
        </div>

        {/* ── Main roles (3 col) ── */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          {PATIENT_ROLES.map(role => {
            const Icon = role.icon
            const isActive = selectedRole === role.id
            const rc = colorMap[role.color]
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => handleRoleSelect(role)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                  isActive ? `${rc.card} ${rc.active}` : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive ? rc.badge : 'bg-gray-200 text-gray-500'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`text-xs font-semibold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{role.label}</span>
              </button>
            )
          })}
        </div>

        {/* ── Staff roles divider ── */}
        <div className="mb-3 flex items-center gap-2">
          <div className="flex-1 border-t border-gray-100" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Staff Portals</span>
          <div className="flex-1 border-t border-gray-100" />
        </div>

        {/* ── Staff roles (2 col) ── */}
        <div className="mb-5 grid grid-cols-2 gap-2">
          {STAFF_ROLES.map(role => {
            const Icon = role.icon
            const isActive = selectedRole === role.id
            const rc = colorMap[role.color]
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => handleRoleSelect(role)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                  isActive ? `${rc.card} ${rc.active}` : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive ? rc.badge : 'bg-gray-200 text-gray-500'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`text-xs font-semibold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{role.label}</span>
                <span className="text-[10px] text-gray-400 leading-tight">{role.description}</span>
              </button>
            )
          })}
        </div>

        {/* Demo hint for non-patient roles */}
        {isStaffRole && (
          <div className={`mb-4 flex items-start gap-2 rounded-lg border px-3 py-2.5 ${
            selectedRole === 'lab_coordinator' ? 'border-teal-100 bg-teal-50' :
            selectedRole === 'pharmacist' ? 'border-purple-100 bg-purple-50' :
            'border-amber-100 bg-amber-50'
          }`}>
            <span className="mt-0.5">💡</span>
            <p className="text-xs text-gray-700">
              Demo credentials pre-filled for <strong>{activeRole.label}</strong>.{' '}
              {!seedDone && <span className="text-gray-400">Setting up demo account…</span>}
              {seedDone && <span>Click <strong>Sign In</strong> to continue.</span>}
            </p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(v => loginMutation.mutate(v))}>
          <Input
            label="Email or Phone"
            placeholder="email@example.com or +923001234567"
            error={errors.emailOrPhone?.message}
            icon={<Mail className="h-4 w-4" />}
            {...register('emailOrPhone')}
          />
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                error={errors.password?.message}
                value={field.value}
                name={field.name}
                onChange={field.onChange}
              />
            )}
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 accent-brand-500" {...register('remember')} />
              Remember me
            </label>
            <button type="button" className="text-brand-500 hover:underline" onClick={() => navigate(ROUTES.forgotPassword)}>
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loginMutation.status === 'pending'}
            className={`w-full rounded-lg py-3 text-sm font-bold text-white disabled:opacity-60 transition-colors ${c.btn}`}
          >
            {loginMutation.status === 'pending' ? 'Signing in…' : `Sign In as ${activeRole.label}`}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-xs text-gray-400">or continue with</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
            </svg>
            Apple
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <button className="font-semibold text-brand-500 hover:underline" onClick={() => navigate(ROUTES.register)}>
            Register Free
          </button>
        </p>

        <p className="mt-4 text-center text-[11px] text-gray-400">
          By continuing, you agree to our{' '}
          <a href="#" className="underline">Terms of Service</a> &amp;{' '}
          <a href="#" className="underline">Privacy Policy</a>
        </p>
      </div>
    </AuthLayout>
  )
}
