import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto, ResendOtpDto } from './dto/otp.dto';
import { ForgotPasswordDto } from './dto/forgot.dto';
import { ResetPasswordDto } from './dto/reset.dto';
import { Request } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        verificationToken: string;
        otp: string | undefined;
        delivered: boolean;
    }>;
    login(dto: LoginDto, req: Request): Promise<{
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
    verifyOtp(dto: VerifyOtpDto): Promise<{
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
    resendOtp(dto: ResendOtpDto): Promise<{
        success: boolean;
        message: string;
        verificationToken: string;
        otp: string | undefined;
        delivered: boolean;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        success: boolean;
        message: string;
        verificationToken: string;
        otp: string | undefined;
        delivered: boolean;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
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
    me(req: Request): Promise<{
        success: boolean;
        data: {
            [key: string]: any;
        } | null;
    }>;
    testEmail(to?: string): Promise<{
        success: boolean;
        sentTo: string;
        smtpUser: string | undefined;
        messageId: string | undefined;
        error: string | undefined;
        hint: string;
    }>;
    seedDemo(): Promise<{
        success: boolean;
        data: {
            email: string;
            password: string;
            role: string;
            status: string;
        }[];
    }>;
}
