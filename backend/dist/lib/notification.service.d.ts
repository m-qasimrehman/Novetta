import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class NotificationService implements OnModuleInit {
    private config;
    private readonly logger;
    private transporter?;
    private smtpFrom?;
    private smtpUser?;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    sendOtpEmail(email: string, code: string): Promise<boolean>;
    testSmtp(to: string): Promise<{
        ok: boolean;
        messageId?: string;
        error?: string;
        smtpUser: string | undefined;
    }>;
    private buildOtpHtml;
}
