"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const bcrypt = __importStar(require("bcrypt"));
const jwt_1 = require("@nestjs/jwt");
const otp_store_service_1 = require("../../lib/otp-store.service");
const prisma_service_1 = require("../../lib/prisma.service");
const notification_service_1 = require("../../lib/notification.service");
let AuthService = AuthService_1 = class AuthService {
    usersService;
    jwtService;
    otpStore;
    prisma;
    notification;
    logger = new common_1.Logger(AuthService_1.name);
    OTP_PREFIX = 'otp:';
    RESET_PREFIX = 'reset:';
    constructor(usersService, jwtService, otpStore, prisma, notification) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.otpStore = otpStore;
        this.prisma = prisma;
        this.notification = notification;
    }
    async register(dto) {
        const existingEmail = await this.usersService.findByEmail(dto.email);
        if (existingEmail)
            throw new common_1.BadRequestException('Email already in use');
        if (dto.phone) {
            const existingPhone = await this.usersService.findByPhone(dto.phone);
            if (existingPhone)
                throw new common_1.BadRequestException('Phone already in use');
        }
        const role = dto.role ?? 'patient';
        const user = await this.usersService.createUser({ name: dto.name, email: dto.email, phone: dto.phone, password: dto.password, role });
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
            });
            // Notify all admins about the new doctor registration
            const admins = await this.prisma.user.findMany({ where: { role: 'admin', isActive: true }, select: { id: true } });
            await Promise.allSettled(admins.map(admin => this.prisma.notification.create({
                data: {
                    userId: admin.id,
                    title: 'New Doctor Registration',
                    body: `Dr. ${dto.name} has applied to join Novetta. Review their profile in the admin panel.`,
                    type: 'system',
                },
            })));
        }
        // generate OTP and store in redis
        const otpResult = await this.generateOtpToken(user.id, dto.email);
        return {
            success: true,
            message: role === 'doctor'
                ? 'Doctor account created. Verify your email, then await admin approval before your profile goes live.'
                : 'Registered. Verify OTP to activate account',
            verificationToken: otpResult.token,
            otp: otpResult.otp,
            delivered: otpResult.delivered,
        };
    }
    async generateOtpToken(userId, identifier) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const token = `v_${Math.random().toString(36).slice(2)}`;
        this.otpStore.set(`${this.OTP_PREFIX}${token}`, JSON.stringify({ userId, identifier, code }), 60 * 10);
        const sent = await this.notification.sendOtpEmail(identifier, code);
        if (!sent) {
            this.logger.warn(`OTP delivery failed for ${identifier}. Falling back to console output.`);
            console.log(`OTP for ${identifier}: ${code}`);
        }
        return {
            token,
            otp: process.env.OTP_DEBUG === 'true' || process.env.NODE_ENV !== 'production' ? code : undefined,
            delivered: sent,
        };
    }
    async login(dto, req) {
        const { identifier, password } = dto;
        const user = identifier.includes('@') ? await this.usersService.findByEmail(identifier) : await this.usersService.findByPhone(identifier);
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (!user.isVerified)
            throw new common_1.BadRequestException('Account not verified');
        const accessToken = this.jwtService.sign({ sub: user.id });
        const refreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' });
        await this.prisma.session.create({ data: { userId: user.id, refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000) } });
        const { passwordHash: _, ...safeUser } = user;
        return { success: true, message: 'Login successful', data: { accessToken, refreshToken, user: safeUser } };
    }
    async verifyOtp(dto) {
        // Registration OTP flow (token starts with v_)
        const otpRaw = this.otpStore.get(`${this.OTP_PREFIX}${dto.token}`);
        if (otpRaw) {
            const parsed = JSON.parse(otpRaw);
            if (parsed.code !== dto.code)
                throw new common_1.BadRequestException('Invalid OTP');
            await this.usersService.update(parsed.userId, { isVerified: true });
            this.otpStore.del(`${this.OTP_PREFIX}${dto.token}`);
            const accessToken = this.jwtService.sign({ sub: parsed.userId });
            const refreshToken = this.jwtService.sign({ sub: parsed.userId }, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' });
            await this.prisma.session.create({ data: { userId: parsed.userId, refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000) } });
            return { success: true, message: 'Account verified', data: { accessToken, refreshToken } };
        }
        // Password reset OTP flow (token starts with r_)
        const resetRaw = this.otpStore.get(`${this.RESET_PREFIX}${dto.token}`);
        if (resetRaw) {
            const parsed = JSON.parse(resetRaw);
            if (parsed.code !== dto.code)
                throw new common_1.BadRequestException('Invalid OTP');
            return { success: true, message: 'OTP verified', resetToken: dto.token };
        }
        throw new common_1.BadRequestException('Invalid or expired token');
    }
    async resendOtp(dto) {
        if (!dto.identifier.includes('@')) {
            throw new common_1.BadRequestException('Email is required for OTP resend');
        }
        const user = await this.usersService.findByEmail(dto.identifier);
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const otpResult = await this.generateOtpToken(user.id, dto.identifier);
        return {
            success: true,
            message: 'OTP resent',
            verificationToken: otpResult.token,
            otp: otpResult.otp,
            delivered: otpResult.delivered,
        };
    }
    async forgotPassword(dto) {
        if (!dto.identifier.includes('@')) {
            throw new common_1.BadRequestException('Email is required for password reset');
        }
        const user = await this.usersService.findByEmail(dto.identifier);
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const token = `r_${Math.random().toString(36).slice(2)}`;
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        this.otpStore.set(`${this.RESET_PREFIX}${token}`, JSON.stringify({ userId: user.id, code }), 60 * 10);
        const sent = await this.notification.sendOtpEmail(dto.identifier, code);
        if (!sent) {
            this.logger.warn(`Reset OTP delivery failed for ${dto.identifier}. Falling back to console output.`);
            console.log(`Reset OTP for ${dto.identifier}: ${code}`);
        }
        return {
            success: true,
            message: 'Reset OTP sent',
            verificationToken: token,
            otp: process.env.OTP_DEBUG === 'true' || process.env.NODE_ENV !== 'production' ? code : undefined,
            delivered: sent,
        };
    }
    async resetPassword(dto) {
        const raw = this.otpStore.get(`${this.RESET_PREFIX}${dto.token}`);
        if (!raw)
            throw new common_1.BadRequestException('Invalid or expired reset token');
        const parsed = JSON.parse(raw);
        if (dto.code && parsed.code !== dto.code)
            throw new common_1.BadRequestException('Invalid OTP code');
        await this.usersService.update(parsed.userId, { passwordHash: await bcrypt.hash(dto.password, 12) });
        this.otpStore.del(`${this.RESET_PREFIX}${dto.token}`);
        return { success: true, message: 'Password updated' };
    }
    async refresh(token) {
        try {
            const payload = this.jwtService.verify(token);
            const userId = payload.sub;
            // verify session exists
            const session = await this.prisma.session.findUnique({ where: { refreshToken: token } });
            if (!session)
                throw new common_1.UnauthorizedException('Invalid refresh token');
            // rotate
            const newRefresh = this.jwtService.sign({ sub: userId }, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' });
            await this.prisma.session.update({ where: { id: session.id }, data: { refreshToken: newRefresh, expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000) } });
            const accessToken = this.jwtService.sign({ sub: userId });
            return { success: true, message: 'Token refreshed', data: { accessToken, refreshToken: newRefresh } };
        }
        catch (err) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(req) {
        const userId = req.user?.sub;
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token)
            throw new common_1.BadRequestException('Missing token');
        await this.prisma.session.deleteMany({ where: { refreshToken: token } });
        return { success: true, message: 'Logged out' };
    }
    async logoutAll(req) {
        const userId = req.user?.sub;
        if (!userId)
            throw new common_1.BadRequestException('Missing user');
        await this.prisma.session.deleteMany({ where: { userId } });
        return { success: true, message: 'Logged out from all devices' };
    }
    async testEmail(to) {
        if (process.env.NODE_ENV === 'production') {
            throw new common_1.BadRequestException('Not available in production');
        }
        const target = to || process.env.SMTP_USER || '';
        if (!target)
            throw new common_1.BadRequestException('Provide a "to" email address in the request body');
        const result = await this.notification.testSmtp(target);
        return {
            success: result.ok,
            sentTo: target,
            smtpUser: result.smtpUser,
            messageId: result.messageId,
            error: result.error,
            hint: result.ok
                ? 'Email delivered — check inbox (and spam folder).'
                : 'SMTP failed. See the "error" field. Most common causes: (1) 2FA not enabled on Gmail, (2) wrong App Password, (3) port 465 blocked by firewall.',
        };
    }
    async me(req) {
        const userId = req.user?.sub;
        const user = await this.usersService.findById(userId);
        return { success: true, data: user };
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
        ];
        const results = [];
        for (const demo of demos) {
            const existing = await this.prisma.user.findUnique({ where: { email: demo.email } });
            if (existing) {
                results.push({ email: demo.email, password: demo.password, role: demo.role, status: 'exists' });
                continue;
            }
            const passwordHash = await bcrypt.hash(demo.password, 10);
            const user = await this.prisma.user.create({
                data: {
                    name: demo.name,
                    email: demo.email,
                    passwordHash,
                    role: demo.role,
                    isVerified: true,
                    isActive: true,
                },
            });
            // Create associated resources
            if (demo.role === 'lab_coordinator') {
                const centerExists = await this.prisma.labCenter.findFirst({ where: { ownerId: user.id } });
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
                    });
                }
            }
            else if (demo.role === 'pharmacist') {
                const pharmacyExists = await this.prisma.pharmacy.findFirst({ where: { ownerId: user.id } });
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
                    });
                }
            }
            results.push({ email: demo.email, password: demo.password, role: demo.role, status: 'created' });
        }
        return { success: true, data: results };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        otp_store_service_1.OtpStoreService,
        prisma_service_1.PrismaService,
        notification_service_1.NotificationService])
], AuthService);
