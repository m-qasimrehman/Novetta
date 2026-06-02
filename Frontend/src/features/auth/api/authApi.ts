import type {
  LoginRequest,
  RegisterRequest,
  OTPRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  User,
} from '../types/auth'
import { apiClient } from '../../../lib/axios'

// Backend wraps token responses in { success, message, data: {...} }
interface BackendWrapped<T> {
  success: boolean
  message: string
  data: T
}

interface TokenData {
  accessToken: string
  refreshToken: string
}

interface LoginData extends TokenData {
  user: {
    id: string
    name: string
    email: string
    phone?: string | null
    role: string
    isVerified: boolean
    isActive: boolean
    createdAt: string
  }
}

// Register and forgot-password return top-level fields (not wrapped in data)
interface OtpDeliveryResponse {
  success: boolean
  message: string
  verificationToken: string
  otp?: string
  delivered: boolean
}

export const authApi = {
  login(body: LoginRequest) {
    return apiClient.post<BackendWrapped<LoginData>>('/auth/login', {
      identifier: body.emailOrPhone,
      password: body.password,
    })
  },

  register(body: RegisterRequest) {
    return apiClient.post<OtpDeliveryResponse>('/auth/register', body)
  },

  verifyOtp(body: OTPRequest) {
    return apiClient.post<BackendWrapped<TokenData> | { success: boolean; message: string; resetToken: string }>('/auth/verify-otp', body)
  },

  resendOtp(email: string) {
    return apiClient.post<OtpDeliveryResponse>('/auth/resend-otp', { identifier: email })
  },

  forgotPassword(body: ForgotPasswordRequest) {
    return apiClient.post<OtpDeliveryResponse>('/auth/forgot-password', {
      identifier: body.emailOrPhone,
    })
  },

  resetPassword(body: ResetPasswordRequest) {
    return apiClient.post<{ success: boolean; message: string }>('/auth/reset-password', body)
  },

  refreshToken(refreshToken: string) {
    return apiClient.post<BackendWrapped<TokenData>>('/auth/refresh', { refreshToken })
  },

  logout() {
    return apiClient.post<{ success: boolean; message: string }>('/auth/logout')
  },

  getProfile() {
    return apiClient.get<BackendWrapped<User>>('/auth/me')
  },
}
