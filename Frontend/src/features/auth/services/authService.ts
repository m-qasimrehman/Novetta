import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  OTPRequest,
} from '../types/auth'
import { authApi } from '../api/authApi'

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000

export const authService = {
  login(request: LoginRequest) {
    return authApi.login(request).then((r) => ({
      ...r.data.data,
      expiresAt: Date.now() + ACCESS_TOKEN_TTL_MS,
    }))
  },

  register(request: RegisterRequest) {
    return authApi.register(request).then((r) => r.data)
  },

  verifyOtp(request: OTPRequest) {
    return authApi.verifyOtp(request).then((r) => {
      if ('resetToken' in r.data) {
        return { resetToken: r.data.resetToken } as { resetToken: string }
      }
      const wrapped = r.data as { success: boolean; message: string; data: { accessToken: string; refreshToken: string } }
      return { accessToken: wrapped.data.accessToken, refreshToken: wrapped.data.refreshToken, expiresAt: Date.now() + ACCESS_TOKEN_TTL_MS }
    })
  },

  resendOtp(email: string) {
    return authApi.resendOtp(email).then((r) => r.data)
  },

  forgotPassword(request: ForgotPasswordRequest) {
    return authApi.forgotPassword(request).then((r) => r.data)
  },

  resetPassword(request: ResetPasswordRequest) {
    return authApi.resetPassword(request).then((r) => r.data)
  },

  refreshToken(refreshToken: string) {
    return authApi.refreshToken(refreshToken).then((r) => ({
      ...r.data.data,
      expiresAt: Date.now() + ACCESS_TOKEN_TTL_MS,
    }))
  },

  logout() {
    return authApi.logout().then((r) => r.data)
  },

  getProfile() {
    return authApi.getProfile().then((r) => r.data.data)
  },
}
