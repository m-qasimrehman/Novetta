import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { ResetPasswordRequest } from '../types/auth'
import { authService } from '../services/authService'
import { PasswordInput } from '../../../components/ui/PasswordInput'
import { AuthLayout } from '../components/AuthLayout'
import { OTPInput } from '../components/OTPInput'
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter'
import { useToast } from '../../../hooks/useToast'
import { resetPasswordSchema, type ResetPasswordFormValues } from '../schemas/authSchemas'
import { ROUTES } from '../../../constants/routes'
import { LockKeyhole } from 'lucide-react'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const token = useMemo(() => new URLSearchParams(location.search).get('token') ?? '', [location.search])

  const { control, handleSubmit, register, watch, formState: { errors } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: '', password: '', confirmPassword: '', token },
  })

  const passwordValue = watch('password')

  type ResetPasswordResult = Awaited<ReturnType<typeof authService.resetPassword>>
  const resetMutation = useMutation<ResetPasswordResult, any, ResetPasswordRequest>({
    mutationFn: authService.resetPassword,
    onSuccess() {
      toast.pushToast({ title: 'Password updated', description: 'You can now sign in with your new password.', variant: 'success' })
      navigate(ROUTES.login)
    },
    onError(error: any) {
      toast.pushToast({ title: 'Reset failed', description: error?.response?.data?.message ?? 'Please retry.', variant: 'error' })
    },
  })

  return (
    <AuthLayout>
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-card">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <LockKeyhole className="h-8 w-8 text-brand-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Reset Password</h1>
          <p className="mt-2 text-sm text-gray-500">Enter the OTP from your email and your new password.</p>
        </div>

        <form
          className="space-y-5"
          onSubmit={handleSubmit(v => resetMutation.mutate({ token: v.token, code: v.code, password: v.password }))}
        >
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Verification Code</p>
            <Controller
              name="code"
              control={control}
              render={({ field }) => <OTPInput value={field.value ?? ''} onChange={field.onChange} />}
            />
            {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>}
          </div>

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <PasswordInput
                  label="New Password"
                  placeholder="Enter new password"
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
                placeholder="Re-enter new password"
                error={errors.confirmPassword?.message}
                value={field.value}
                name={field.name}
                onChange={field.onChange}
              />
            )}
          />
          <input type="hidden" value={token} {...register('token')} />

          <button
            type="submit"
            disabled={resetMutation.status === 'pending'}
            className="w-full rounded-lg bg-brand-500 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {resetMutation.status === 'pending' ? 'Updating…' : 'Update Password'}
          </button>
        </form>

        <button
          type="button"
          className="mt-4 block w-full text-center text-sm text-gray-400 hover:text-gray-600"
          onClick={() => navigate(ROUTES.login)}
        >
          ← Back to login
        </button>
      </div>
    </AuthLayout>
  )
}
