import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { OtpStoreService } from '../../lib/otp-store.service'
import { PrismaService } from '../../lib/prisma.service'
import { NotificationService } from '../../lib/notification.service'
import type { Request } from 'express'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  private OTP_PREFIX = 'otp:'
  private RESET_PREFIX = 'reset:'

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private otpStore: OtpStoreService,
    private prisma: PrismaService,
    private notification: NotificationService,
  ) {}

  async register(dto: {
    name: string; email: string; phone?: string; password: string
    role?: 'patient' | 'doctor'
    specialization?: string; qualification?: string; experience?: number; city?: string
  }) {
    const existingEmail = await this.usersService.findByEmail(dto.email)
    if (existingEmail) throw new BadRequestException('Email already in use')
    if (dto.phone) {
      const existingPhone = await this.usersService.findByPhone(dto.phone)
      if (existingPhone) throw new BadRequestException('Phone already in use')
    }

    const role = dto.role ?? 'patient'
    const user = await this.usersService.createUser({ name: dto.name, email: dto.email, phone: dto.phone, password: dto.password, role })

    // For doctor registrations, create the Doctor profile (pending admin approval)
    if (role === 'doctor') {
      await this.prisma.doctor.create({
        data: {
          userId: user.id,
          specialization: dto.specialization ?? null,
          qualification: dto.qualification ?? null,
          experience: dto.experience ?? 0,
          city: dto.city ?? null,
          isVerified: false,
        },
      })

      // Notify all admins about the new doctor registration
      const admins = await this.prisma.user.findMany({ where: { role: 'admin', isActive: true }, select: { id: true } })
      await Promise.allSettled(admins.map(admin =>
        this.prisma.notification.create({
          data: {
            userId: admin.id,
            title: 'New Doctor Registration',
            body: `Dr. ${dto.name} has applied to join Novetta. Review their profile in the admin panel.`,
            type: 'system',
          },
        })
      ))
    }

    // generate OTP and store in redis
    const otpResult = await this.generateOtpToken(user.id, dto.email)

    return {
      success: true,
      message: role === 'doctor'
        ? 'Doctor account created. Verify your email, then await admin approval before your profile goes live.'
        : 'Registered. Verify OTP to activate account',
      verificationToken: otpResult.token,
      otp: otpResult.otp,
      delivered: otpResult.delivered,
    }
  }

  private async generateOtpToken(userId: string, identifier: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const token = `v_${Math.random().toString(36).slice(2)}`
    this.otpStore.set(`${this.OTP_PREFIX}${token}`, JSON.stringify({ userId, identifier, code }), 60 * 10)

    const sent = await this.notification.sendOtpEmail(identifier, code)

    if (!sent) {
      this.logger.warn(`OTP delivery failed for ${identifier}. Falling back to console output.`)
      console.log(`OTP for ${identifier}: ${code}`)
    }

    return {
      token,
      otp: process.env.OTP_DEBUG === 'true' || process.env.NODE_ENV !== 'production' ? code : undefined,
      delivered: sent,
    }
  }

  async login(dto: { identifier: string; password: string }, req: Request) {
    const { identifier, password } = dto
    const user = identifier.includes('@') ? await this.usersService.findByEmail(identifier) : await this.usersService.findByPhone(identifier)
    if (!user) throw new UnauthorizedException('Invalid credentials')
    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) throw new UnauthorizedException('Invalid credentials')
    if (!user.isVerified) throw new BadRequestException('Account not verified')

    const accessToken = this.jwtService.sign({ sub: user.id })
    const refreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' })

    await this.prisma.session.create({ data: { userId: user.id, refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000) } })

    const { passwordHash: _, ...safeUser } = user
    return { success: true, message: 'Login successful', data: { accessToken, refreshToken, user: safeUser } }
  }

  async verifyOtp(dto: { token: string; code: string }) {
    // Registration OTP flow (token starts with v_)
    const otpRaw = this.otpStore.get(`${this.OTP_PREFIX}${dto.token}`)
    if (otpRaw) {
      const parsed = JSON.parse(otpRaw)
      if (parsed.code !== dto.code) throw new BadRequestException('Invalid OTP')
      await this.usersService.update(parsed.userId, { isVerified: true })
      this.otpStore.del(`${this.OTP_PREFIX}${dto.token}`)
      const accessToken = this.jwtService.sign({ sub: parsed.userId })
      const refreshToken = this.jwtService.sign({ sub: parsed.userId }, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' })
      await this.prisma.session.create({ data: { userId: parsed.userId, refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000) } })
      return { success: true, message: 'Account verified', data: { accessToken, refreshToken } }
    }

    // Password reset OTP flow (token starts with r_)
    const resetRaw = this.otpStore.get(`${this.RESET_PREFIX}${dto.token}`)
    if (resetRaw) {
      const parsed = JSON.parse(resetRaw)
      if (parsed.code !== dto.code) throw new BadRequestException('Invalid OTP')
      return { success: true, message: 'OTP verified', resetToken: dto.token }
    }

    throw new BadRequestException('Invalid or expired token')
  }

  async resendOtp(dto: { identifier: string }) {
    if (!dto.identifier.includes('@')) {
      throw new BadRequestException('Email is required for OTP resend')
    }
    const user = await this.usersService.findByEmail(dto.identifier)
    if (!user) throw new BadRequestException('User not found')
    const otpResult = await this.generateOtpToken(user.id, dto.identifier)
    return {
      success: true,
      message: 'OTP resent',
      verificationToken: otpResult.token,
      otp: otpResult.otp,
      delivered: otpResult.delivered,
    }
  }

  async forgotPassword(dto: { identifier: string }) {
    if (!dto.identifier.includes('@')) {
      throw new BadRequestException('Email is required for password reset')
    }
    const user = await this.usersService.findByEmail(dto.identifier)
    if (!user) throw new BadRequestException('User not found')
    const token = `r_${Math.random().toString(36).slice(2)}`
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    this.otpStore.set(`${this.RESET_PREFIX}${token}`, JSON.stringify({ userId: user.id, code }), 60 * 10)

    const sent = await this.notification.sendOtpEmail(dto.identifier, code)

    if (!sent) {
      this.logger.warn(`Reset OTP delivery failed for ${dto.identifier}. Falling back to console output.`)
      console.log(`Reset OTP for ${dto.identifier}: ${code}`)
    }

    return {
      success: true,
      message: 'Reset OTP sent',
      verificationToken: token,
      otp: process.env.OTP_DEBUG === 'true' || process.env.NODE_ENV !== 'production' ? code : undefined,
      delivered: sent,
    }
  }

  async resetPassword(dto: { token: string; code?: string; password: string }) {
    const raw = this.otpStore.get(`${this.RESET_PREFIX}${dto.token}`)
    if (!raw) throw new BadRequestException('Invalid or expired reset token')
    const parsed = JSON.parse(raw)
    if (dto.code && parsed.code !== dto.code) throw new BadRequestException('Invalid OTP code')
    await this.usersService.update(parsed.userId, { passwordHash: await bcrypt.hash(dto.password, 12) })
    this.otpStore.del(`${this.RESET_PREFIX}${dto.token}`)
    return { success: true, message: 'Password updated' }
  }

  async refresh(token: string) {
    try {
      const payload = this.jwtService.verify(token)
      const userId = payload.sub as string
      // verify session exists
      const session = await this.prisma.session.findUnique({ where: { refreshToken: token } })
      if (!session) throw new UnauthorizedException('Invalid refresh token')
      // rotate
      const newRefresh = this.jwtService.sign({ sub: userId }, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' })
      await this.prisma.session.update({ where: { id: session.id }, data: { refreshToken: newRefresh, expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000) } })
      const accessToken = this.jwtService.sign({ sub: userId })
      return { success: true, message: 'Token refreshed', data: { accessToken, refreshToken: newRefresh } }
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async logout(req: Request) {
    const userId = (req as any).user?.sub as string
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) throw new BadRequestException('Missing token')
    await this.prisma.session.deleteMany({ where: { refreshToken: token } })
    return { success: true, message: 'Logged out' }
  }

  async logoutAll(req: Request) {
    const userId = (req as any).user?.sub as string
    if (!userId) throw new BadRequestException('Missing user')
    await this.prisma.session.deleteMany({ where: { userId } })
    return { success: true, message: 'Logged out from all devices' }
  }

  async testEmail(to?: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException('Not available in production')
    }
    const target = to || process.env.SMTP_USER || ''
    if (!target) throw new BadRequestException('Provide a "to" email address in the request body')
    const result = await this.notification.testSmtp(target)
    return {
      success: result.ok,
      sentTo: target,
      smtpUser: result.smtpUser,
      messageId: result.messageId,
      error: result.error,
      hint: result.ok
        ? 'Email delivered — check inbox (and spam folder).'
        : 'SMTP failed. See the "error" field. Most common causes: (1) 2FA not enabled on Gmail, (2) wrong App Password, (3) port 465 blocked by firewall.',
    }
  }

  async me(req: Request) {
    const userId = (req as any).user?.sub as string
    const user = await this.usersService.findById(userId)
    return { success: true, data: user }
  }

  async seedDemoUsers() {
    const demos = [
      {
        name: 'Demo Pharmacist',
        email: 'pharmacist@novetta.health',
        password: 'Pharmacist123!',
        role: 'pharmacist',
      },
      {
        name: 'Demo Lab Coordinator',
        email: 'labcoord@novetta.health',
        password: 'LabCoord123!',
        role: 'lab_coordinator',
      },
    ]

    const results: { email: string; password: string; role: string; status: string }[] = []

    for (const demo of demos) {
      const existing = await this.prisma.user.findUnique({ where: { email: demo.email } })

      if (existing) {
        results.push({ email: demo.email, password: demo.password, role: demo.role, status: 'exists' })
        continue
      }

      const passwordHash = await bcrypt.hash(demo.password, 10)
      const user = await this.prisma.user.create({
        data: {
          name: demo.name,
          email: demo.email,
          passwordHash,
          role: demo.role,
          isVerified: true,
          isActive: true,
        },
      })

      // Create associated resources
      if (demo.role === 'lab_coordinator') {
        const centerExists = await this.prisma.labCenter.findFirst({ where: { ownerId: user.id } })
        if (!centerExists) {
          await this.prisma.labCenter.create({
            data: {
              name: 'Novetta Diagnostics',
              address: 'F-10 Markaz, Islamabad',
              city: 'Islamabad',
              phone: '+92-51-1234567',
              email: 'lab@novetta.health',
              openTime: '07:00',
              closeTime: '20:00',
              workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
              homeCollection: true,
              collectionZones: ['F-10', 'G-10', 'E-11', 'F-11', 'I-8', 'G-9'],
              ownerId: user.id,
            },
          })
        }
      } else if (demo.role === 'pharmacist') {
        const pharmacyExists = await this.prisma.pharmacy.findFirst({ where: { ownerId: user.id } })
        if (!pharmacyExists) {
          await this.prisma.pharmacy.create({
            data: {
              name: 'Novetta Pharmacy',
              address: 'G-9 Markaz, Islamabad',
              city: 'Islamabad',
              phone: '+92-51-9876543',
              offersDelivery: true,
              offersPickup: true,
              ownerId: user.id,
            },
          })
        }
      }

      results.push({ email: demo.email, password: demo.password, role: demo.role, status: 'created' })
    }

    return { success: true, data: results }
  }
}
