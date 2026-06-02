import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { OtpStoreService } from '../../lib/otp-store.service';
import { PrismaService } from '../../lib/prisma.service';
import { NotificationService } from '../../lib/notification.service';
import type { Request } from 'express';
export declare class AuthService {
    private usersService;
    private jwtService;
    private otpStore;
    private prisma;
    private notification;
    private readonly logger;
    private OTP_PREFIX;
    private RESET_PREFIX;
    constructor(usersService: UsersService, jwtService: JwtService, otpStore: OtpStoreService, prisma: PrismaService, notification: NotificationService);
    register(dto: {
        name: string;
        email: string;
        phone?: string;
        password: string;
        role?: 'patient' | 'doctor';
        specialization?: string;
        qualification?: string;
        experience?: number;
        city?: string;
    }): Promise<{
        success: boolean;
        message: string;
        verificationToken: string;
        otp: string | undefined;
        delivered: boolean;
    }>;
    private generateOtpToken;
    login(dto: {
        identifier: string;
        password: string;
    }, req: Request): Promise<{
        success: boolean;
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            user: {
                id: string;
                name: string;
                email: string;
                phone: string | null;
                role: string;
                isVerified: boolean;
                isActive: boolean;
                createdAt: Date;
            };
        };
    }>;
    verifyOtp(dto: {
        token: string;
        code: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
        };
        resetToken?: undefined;
    } | {
        success: boolean;
        message: string;
        resetToken: string;
        data?: undefined;
    }>;
    resendOtp(dto: {
        identifier: string;
    }): Promise<{
        success: boolean;
        message: string;
        verificationToken: string;
        otp: string | undefined;
        delivered: boolean;
    }>;
    forgotPassword(dto: {
        identifier: string;
    }): Promise<{
        success: boolean;
        message: string;
        verificationToken: string;
        otp: string | undefined;
        delivered: boolean;
    }>;
    resetPassword(dto: {
        token: string;
        code?: string;
        password: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    refresh(token: string): Promise<{
        success: boolean;
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    logout(req: Request): Promise<{
        success: boolean;
        message: string;
    }>;
    logoutAll(req: Request): Promise<{
        success: boolean;
        message: string;
    }>;
    testEmail(to?: string): Promise<{
        success: boolean;
        sentTo: string;
        smtpUser: string | undefined;
        messageId: string | undefined;
        error: string | undefined;
        hint: string;
    }>;
    me(req: Request): Promise<{
        success: boolean;
        data: {
            [key: string]: any;
        } | null;
    }>;
    seedDemoUsers(): Promise<{
        success: boolean;
        data: {
            email: string;
            password: string;
            role: string;
            status: string;
        }[];
    }>;
}
