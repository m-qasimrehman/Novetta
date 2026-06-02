import { z } from 'zod'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^\+?[1-9][0-9]{7,14}$/
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

export const loginSchema = z.object({
  emailOrPhone: z
    .string()
    .min(1, 'Email or phone is required')
    .refine((value) => emailPattern.test(value) || phonePattern.test(value), {
      message: 'Enter a valid email address or international phone number',
    }),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  remember: z.boolean().optional(),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    role: z.enum(['patient', 'doctor']).default('patient'),
    name: z.string().min(3, 'Full name must be at least 3 characters long'),
    email: z.string().min(1, 'Email is required').regex(emailPattern, 'Enter a valid email address'),
    phone: z.string().regex(phonePattern, 'Enter a valid international phone number').optional().or(z.literal('')),
    password: z.string().min(8, 'Password must be at least 8 characters long').regex(passwordPattern, {
      message: 'Password must include uppercase, lowercase, number and special character',
    }),
    confirmPassword: z.string().min(1, 'Confirm your password'),
    // Doctor-only fields
    specialization: z.string().optional(),
    qualification: z.string().optional(),
    experience: z.coerce.number().min(0).optional(),
    city: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.role !== 'doctor' || !!data.specialization?.trim(), {
    message: 'Specialization is required for doctor registration',
    path: ['specialization'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>

export const otpSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
  code: z.string().length(6, 'Enter the 6-digit OTP'),
})

export type OtpFormValues = z.infer<typeof otpSchema>

export const forgotPasswordSchema = z.object({
  emailOrPhone: z
    .string()
    .min(1, 'Email or phone is required')
    .refine((value) => emailPattern.test(value) || phonePattern.test(value), {
      message: 'Enter a valid email address or international phone number',
    }),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    code: z.string().length(6, 'Enter the 6-digit OTP'),
    password: z.string().min(8, 'Password must be at least 8 characters long').regex(passwordPattern, {
      message: 'Password must include uppercase, lowercase, number and special character',
    }),
    confirmPassword: z.string().min(1, 'Confirm your password'),
    token: z.string().min(1, 'Reset token is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
