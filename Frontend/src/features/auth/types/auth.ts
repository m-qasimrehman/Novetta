export type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated' | 'loading'

export type AuthRole = 'patient' | 'doctor' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  phone?: string | null
  role: AuthRole
  isVerified?: boolean
  createdAt?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface LoginRequest {
  emailOrPhone: string
  password: string
  remember?: boolean
}

export interface RegisterRequest {
  name: string
  email: string
  phone?: string
  password: string
  role?: 'patient' | 'doctor'
  specialization?: string
  qualification?: string
  experience?: number
  city?: string
}

export interface OTPRequest {
  token: string
  code: string
}

export interface ForgotPasswordRequest {
  emailOrPhone: string
}

export interface ResetPasswordRequest {
  token: string
  code?: string
  password: string
}
