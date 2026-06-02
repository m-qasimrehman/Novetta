import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { OTPRequest } from '../types/auth'
import { useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { authStore } from '../store/authStore'
import { AuthLayout } from '../components/AuthLayout'
import { OTPInput } from '../components/OTPInput'
import { useToast } from '../../../hooks/useToast'
import { otpSchema, type OtpFormValues } from '../schemas/authSchemas'
import { ROUTES } from '../../../constants/routes'
import { MailCheck } from 'lucide-react'

export function VerifyOTPPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  const defaultToken = useMemo(() => new URLSearchParams(location.search).get('token') ?? '', [location.search])
  const email = (location.state as { email?: string; otp?: string } | null)?.email ?? ''
  const devOtp = (location.state as { email?: string; otp?: string } | null)?.otp ?? ''

  const { control, handleSubmit, register } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { token: defaultToken, code: devOtp },
  })

  const verifyMutation = useMutation({
    mutationFn: (req: OTPRequest) => authService.verifyOtp(req),
    onSuccess(data) {
      if ('resetToken' in data) {
        navigate(`${ROUTES.resetPassword}?token=${encodeURIComponent(data.resetToken)}`)
        return
      }
      authStore.getState().setAuth({
        user: null,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
      })
      toast.pushToast({ title: 'Account verified!', description: 'Welcome to Novetta. Complete your profile to get started.', variant: 'success' })
      navigate(ROUTES.profile + '?onboarding=1')
    },
    onError(error: any) {
      toast.pushToast({ title: 'Verification failed', description: error?.response?.data?.message ?? 'Please try again.', variant: 'error' })
    },
  })

  const resendMutation = useMutation({
    mutationFn: () => authService.resendOtp(email),
    onSuccess() {
      toast.pushToast({ title: 'OTP resent', description: 'A new code has been sent to your email.', variant: 'success' })
    },
    onError(error: any) {
      toast.pushToast({ title: 'Resend failed', description: error?.response?.data?.message ?? 'Please try again.', variant: 'error' })
    },
  })

  return (
    <AuthLayout>
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-card">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <MailCheck className="h-8 w-8 text-brand-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Verify your email</h1>
          <p className="mt-2 text-sm text-gray-500">
            A 6-digit code has been sent to{' '}
            <span className="font-medium text-gray-700">{email || 'your registered email'}</span>.
            Enter it below to activate your account.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(v => verifyMutation.mutate(v))}>
          <Controller
            name="code"
            control={control}
            render={({ field }) => <OTPInput value={field.value ?? ''} onChange={field.onChange} />}
          />
          <input type="hidden" {...register('token')} />

          <button
            type="submit"
            disabled={verifyMutation.status === 'pending'}
            className="w-full rounded-lg bg-brand-500 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {verifyMutation.status === 'pending' ? 'Verifying…' : 'Verify OTP'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-gray-500">
          Didn't receive the code?{' '}
          {email ? (
            <button
              className="font-semibold text-brand-500 hover:underline disabled:opacity-60"
              onClick={() => resendMutation.mutate()}
              disabled={resendMutation.status === 'pending'}
            >
              {resendMutation.status === 'pending' ? 'Sending…' : 'Resend OTP'}
            </button>
          ) : (
            <button
              className="font-semibold text-brand-500 hover:underline"
              onClick={() => navigate(ROUTES.login)}
            >
              Go back and try again
            </button>
          )}
        </div>

        <button
          className="mt-3 block w-full text-center text-sm text-gray-400 hover:text-gray-600"
          onClick={() => navigate(ROUTES.login)}
        >
          ← Back to login
        </button>
      </div>
    </AuthLayout>
  )
}
