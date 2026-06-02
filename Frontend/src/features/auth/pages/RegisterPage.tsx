import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import type { RegisterRequest } from '../types/auth'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { Input } from '../../../components/ui/Input'
import { PasswordInput } from '../../../components/ui/PasswordInput'
import { AuthLayout } from '../components/AuthLayout'
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter'
import { useToast } from '../../../hooks/useToast'
import { registerSchema, type RegisterFormValues } from '../schemas/authSchemas'
import { ROUTES } from '../../../constants/routes'
import { ShieldCheck, Mail, Phone, User, Stethoscope, GraduationCap, MapPin, Briefcase } from 'lucide-react'

const SPECIALIZATIONS = [
  'General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician',
  'Orthopedic Surgeon', 'Gynecologist', 'Neurologist', 'Psychiatrist',
  'ENT Specialist', 'Ophthalmologist', 'Urologist', 'Gastroenterologist',
  'Endocrinologist', 'Pulmonologist', 'Nephrologist', 'Oncologist',
]

export function RegisterPage() {
  const navigate = useNavigate()
  const toast = useToast()

  type RegisterResult = Awaited<ReturnType<typeof authService.register>>

  const registerMutation = useMutation<RegisterResult, any, RegisterRequest>({
    mutationFn: authService.register,
    onSuccess(data, variables) {
      if (data.otp) {
        toast.pushToast({ title: 'Account created! (Dev Mode)', description: `Your OTP is: ${data.otp}`, variant: 'success' })
      } else {
        toast.pushToast({ title: 'Account created!', description: 'Please verify your OTP to activate.', variant: 'success' })
      }
      navigate(`${ROUTES.verifyOtp}?token=${encodeURIComponent(data.verificationToken)}`, {
        state: { email: variables.email, otp: data.otp },
      })
    },
    onError(error: any) {
      toast.pushToast({
        title: 'Registration failed',
        description: error?.response?.data?.message ?? 'Please review your input and try again.',
        variant: 'error',
      })
    },
  })

  const { control, register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'patient', name: '', email: '', phone: '', password: '', confirmPassword: '', specialization: '', qualification: '', city: '' },
  })

  const role = watch('role')
  const passwordValue = watch('password')
  const isDoctor = role === 'doctor'

  const onSubmit = (v: RegisterFormValues) => {
    const payload: RegisterRequest = {
      name: v.name,
      email: v.email,
      phone: v.phone || undefined,
      password: v.password,
      role: v.role,
      ...(isDoctor ? {
        specialization: v.specialization,
        qualification: v.qualification,
        experience: v.experience,
        city: v.city,
      } : {}),
    }
    registerMutation.mutate(payload)
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-8 shadow-card">
        {/* Logo */}
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-1">
            <span className="text-2xl font-black text-brand-500">Novetta</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Create your account</h1>
          <p className="mt-1 text-sm text-gray-500">Join millions managing their health on Novetta</p>
        </div>

        {/* Role selector */}
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <div className="mb-5 grid grid-cols-2 gap-3">
              {(['patient', 'doctor'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => field.onChange(r)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    field.value === r
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {r === 'patient'
                    ? <User className="h-6 w-6" />
                    : <Stethoscope className="h-6 w-6" />}
                  <div className="text-center">
                    <p className="text-sm font-bold capitalize">{r === 'patient' ? 'I am a Patient' : 'I am a Doctor'}</p>
                    <p className="text-xs mt-0.5 font-normal">
                      {r === 'patient' ? 'Find doctors & medicines' : 'Join our medical network'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        />

        {isDoctor && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
            <p className="font-semibold">Doctor registration requires admin approval.</p>
            <p className="mt-0.5">Your profile will be reviewed and approved before patients can book you.</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Full Name"
            placeholder={isDoctor ? 'Dr. Muhammad Qasim' : 'Muhammad Qasim'}
            error={errors.name?.message}
            icon={<User className="h-4 w-4" />}
            {...register('name')}
          />
          <Input
            label="Email Address"
            placeholder="email@example.com"
            error={errors.email?.message}
            icon={<Mail className="h-4 w-4" />}
            {...register('email')}
          />
          <Input
            label="Phone Number (optional)"
            placeholder="+923001234567"
            error={errors.phone?.message}
            icon={<Phone className="h-4 w-4" />}
            {...register('phone')}
          />

          {/* Doctor-specific fields */}
          {isDoctor && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Specialization <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <Stethoscope className="h-4 w-4" />
                  </span>
                  <select
                    {...register('specialization')}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-800 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200"
                  >
                    <option value="">Select specialization</option>
                    {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {errors.specialization && <p className="mt-1 text-xs text-red-500">{errors.specialization.message}</p>}
              </div>
              <Input
                label="Qualification (e.g. MBBS, MD, FCPS)"
                placeholder="MBBS, FCPS"
                error={errors.qualification?.message}
                icon={<GraduationCap className="h-4 w-4" />}
                {...register('qualification')}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Years of Experience"
                  placeholder="5"
                  type="number"
                  error={errors.experience?.message}
                  icon={<Briefcase className="h-4 w-4" />}
                  {...register('experience')}
                />
                <Input
                  label="City"
                  placeholder="Lahore"
                  error={errors.city?.message}
                  icon={<MapPin className="h-4 w-4" />}
                  {...register('city')}
                />
              </div>
            </>
          )}

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <PasswordInput
                  label="Password"
                  placeholder="Create a strong password"
                  error={errors.password?.message}
                  value={field.value}
                  name={field.name}
                  onChange={field.onChange}
                />
                <PasswordStrengthMeter password={passwordValue} />
              </div>
            )}
          />
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <PasswordInput
                label="Confirm Password"
                placeholder="Re-enter your password"
                error={errors.confirmPassword?.message}
                value={field.value}
                name={field.name}
                onChange={field.onChange}
              />
            )}
          />

          <button
            type="submit"
            disabled={registerMutation.status === 'pending'}
            className="w-full rounded-lg bg-brand-500 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {registerMutation.status === 'pending'
              ? 'Creating account…'
              : isDoctor ? 'Apply as Doctor' : 'Create Account'}
          </button>
        </form>

        {/* Trust badges */}
        <div className="mt-5 flex items-center justify-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
            SSL Secured
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
            OTP Verified
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <button className="font-semibold text-brand-500 hover:underline" onClick={() => navigate(ROUTES.login)}>
            Sign In
          </button>
        </p>

        <p className="mt-3 text-center text-[11px] text-gray-400">
          By registering, you agree to our{' '}
          <a href="#" className="underline">Terms</a> &amp;{' '}
          <a href="#" className="underline">Privacy Policy</a>
        </p>
      </div>
    </AuthLayout>
  )
}
