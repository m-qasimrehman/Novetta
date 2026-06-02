import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { ForgotPasswordRequest } from '../types/auth'
import { authService } from '../services/authService'
import { Input } from '../../../components/ui/Input'
import { AuthLayout } from '../components/AuthLayout'
import { useToast } from '../../../hooks/useToast'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../schemas/authSchemas'
import { ROUTES } from '../../../constants/routes'
import { KeyRound, Mail } from 'lucide-react'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const toast = useToast()

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { emailOrPhone: '' },
  })

  type ForgotPasswordResult = Awaited<ReturnType<typeof authService.forgotPassword>>
  const requestMutation = useMutation<ForgotPasswordResult, any, ForgotPasswordRequest>({
    mutationFn: authService.forgotPassword,
    onSuccess(data) {
      toast.pushToast({
        title: 'Reset code sent',
        description: 'Check your email for the reset code.',
        variant: 'success',
      })
      navigate(`${ROUTES.resetPassword}?token=${encodeURIComponent(data.verificationToken)}`)
    },
    onError(error: any) {
      toast.pushToast({ title: 'Request failed', description: error?.response?.data?.message ?? 'Please retry.', variant: 'error' })
    },
  })

  return (
    <AuthLayout>
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-card">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <KeyRound className="h-8 w-8 text-brand-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Forgot Password?</h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your registered email address and we'll send you a reset link.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(v => requestMutation.mutate(v))}>
          <Input
            label="Email Address"
            placeholder="email@example.com"
            error={errors.emailOrPhone?.message}
            icon={<Mail className="h-4 w-4" />}
            {...register('emailOrPhone')}
          />
          <button
            type="submit"
            disabled={requestMutation.status === 'pending'}
            className="w-full rounded-lg bg-brand-500 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {requestMutation.status === 'pending' ? 'Sending…' : 'Send Reset Code'}
          </button>
        </form>

        <button
          className="mt-5 block w-full text-center text-sm text-gray-400 hover:text-gray-600"
          onClick={() => navigate(ROUTES.login)}
        >
          ← Back to login
        </button>
      </div>
    </AuthLayout>
  )
}
